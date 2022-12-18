const { By, Key, until } = require('selenium-webdriver');
const { timeout } = require('../utils/selenium');
const { generateRandomId } = require('../utils/general');
const fs = require('fs');
const path = require('path');


function HackerNewsScraper(driver, seedUrl) {
	this.driver = driver;
	this.seedUrl = seedUrl;
	const seedUrlObj = new URL(this.seedUrl)

	this.contentTrees = [];
	
	this.isPost = seedUrlObj.pathname.includes('/item') && seedUrlObj.search.includes('?id=')

	this.getElementHTML = async function(element) {
		try {
			const string = await this.driver.executeScript('return arguments[0].outerHTML', element)
			return string;
		} catch(e) {
			return null
		}
	}

	this.getAllFeedPosts = async function() {
		const postsBy = By.css('tr.athing')
		let postElements = [];
		try {
			postElements = await this.driver.findElements(postsBy);
		} catch(e) {
			console.log(e);
		}

		return postElements;
	}

	this.getOPPost = async function() {
		// youtube OP post is too different to use parseElementToRootNode
		// upsert instead of create/ignore
		const opPostBy = By.css('.fatitem .athing')
		
		let opPostEl; 
		try {
			opPostEl = await this.driver.findElement(opPostBy);
		} catch(e) {
			console.log(e)
		}

		return opPostEl
	}

	this.getTopLevelComments = async function() {
		const allCommentElements = await this.driver.executeScript(`
			return document.querySelectorAll('.comment-tree tbody > .athing.comtr');
		`);

		return allCommentElements
	}


}

HackerNewsScraper.prototype.scrape = async function() {
	this.driver.get(this.seedUrl)

	const HTMLContentMapping = {
		'text-post': [],
		'text-feed-item': [],
		'comment': []
	}
	if (this.isPost) {
		const opPost = await this.getOPPost()
		if (opPost) {
			HTMLContentMapping['text-post'].push(await this.getElementHTML(opPost));
		}
		const topLevelComments = await this.getTopLevelComments();
		if (topLevelComments) {
			for (let comment of topLevelComments) {
				HTMLContentMapping['comment'].push(await this.getElementHTML(comment))
			}
		}
	} else { // assume feed page
		const feedPostsElements = await this.getAllFeedPosts()
		
		for (let [i, feedPostEl] of feedPostsElements.entries()) {
			HTMLContentMapping['text-feed-item'].push(await this.getElementHTML(feedPostEl))
		}
	}

	return HTMLContentMapping
}


module.exports = HackerNewsScraper;