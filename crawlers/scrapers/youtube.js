const { By, Key, until } = require('selenium-webdriver');
const { timeout } = require('../utils/selenium');
const { generateRandomId } = require('../utils/general');
const fs = require('fs');
const path = require('path');


function YoutubeScraper(driver, seedUrl) {
	this.driver = driver;
	this.seedUrl = seedUrl;
	const seedUrlObj = new URL(this.seedUrl)

	this.contentTrees = [];
	
	this.isPost = seedUrlObj.pathname.includes('/watch') && seedUrlObj.search.includes('?v=')

	this.hasRecommended = true;

	this.getElementHTML = async function(element) {
		try {
			const string = await this.driver.executeScript('return arguments[0].outerHTML', element)
			return string;
		} catch(e) {
			return null
		}
	}

	this.getAllFeedPosts = async function() {
		const postsBy = By.css('#contents ytd-rich-grid-media')
		let postElements = [];
		try {
			await driver.wait(until.elementLocated(postsBy, 10));
			postElements = await this.driver.findElements(postsBy);
		} catch(e) {
			console.log(e);
		}

		return postElements;
	}

	this.getOPPost = async function() {
		await this.driver.executeScript("window.scrollBy(0,1000) ")

		// youtube OP post is too different to use parseElementToRootNode
		// upsert instead of create/ignore
		const opPostBy = By.css('.watch-active-metadata')
		let opPostEl;

		try {
			await driver.wait(until.elementLocated(opPostBy, 10));
			opPostEl = await this.driver.findElement(opPostBy);
		} catch(e) {
			console.log(e)
		}

		return opPostEl
	}

	this.getTopLevelComments = async function() {
		// returns list of contentTrees
		// don't get replies yet
		await this.driver.executeScript("window.scrollBy(0,1000)")
		await this.driver.executeScript("window.scrollBy(0,-500)")

		const topLevelCommentsBy = By.css('#contents ytd-comment-renderer')
		await driver.wait(until.elementLocated(topLevelCommentsBy, 10));

		const topCommentElements = await this.driver.findElements(topLevelCommentsBy);

		return topCommentElements;
	}
}

YoutubeScraper.prototype.scrape = async function() {
	this.driver.get(this.seedUrl)

	const HTMLContentMapping = {
		'video-post': [],
		'video-post-feed': [],
		'video-feed-item': [],
		'comment': []
	}

	if (this.isPost) {
		const postEl = await this.getOPPost()
		if (postEl) {
			HTMLContentMapping['video-post'].push(await this.getElementHTML(postEl))
		}
		const topLevelComments = await this.getTopLevelComments() 
		if (topLevelComments) {
			for (let comment of topLevelComments) {
				HTMLContentMapping['comment'].push(await this.getElementHTML(comment))
			}
		}
	} else { // assume feed page
		// scraping should adapt to channels and front page

		const feedPostsElements = await this.getAllFeedPosts()
		for (let [i, feedPostEl] of feedPostsElements.entries()) {
			HTMLContentMapping['video-feed-item'].push(await this.getElementHTML(feedPostEl))
		}
	}
	console.log(HTMLContentMapping);
	return HTMLContentMapping
}

YoutubeScraper.prototype.getRecommendedContentTrees = async function() {
	const recommendedContentNodes = [];

	try {
		const recommendedContentBy = By.css('ytd-watch-next-secondary-results-renderer #items ytd-compact-video-renderer')

		const recommendedContentElements = await this.driver.findElements(recommendedContentBy);
		for (let [i, recommendedContentElement] of recommendedContentElements.entries()) {
			const recommendedContentNode = await this.parseElementToRootNode(recommendedContentElement);
			console.log("scraped recommended content", i+1, "/", recommendedContentElements.length)
			recommendedContentNode.isRecommended = true;
			recommendedContentNodes.push(recommendedContentNode);
		}

	} catch(e) {
		// console.log(e)
	}

	return recommendedContentNodes
}


module.exports = YoutubeScraper;