const { By, Key, until } = require('selenium-webdriver');
const { timeout } = require('../utils/selenium');
const { generateRandomId } = require('../utils/general');

/*
ContentNode {
	id
	title
	*url
	*opUrl
	*textContent
	datePosted
	*topics
	posterName
	posterProfileUrl
	platform
	isSubContent
	is
	outboundLink
}
*/

function RedditScraper(driver, seedUrl) {
	this.driver = driver;
	this.seedUrl = seedUrl;
	const seedUrlObj = new URL(this.seedUrl)
	this.isPost = seedUrlObj.pathname.includes('/comments/')

	this.contentTrees = [];


	this.getElementHTML = async function(element) {
		try {
			const string = await this.driver.executeScript('return arguments[0].outerHTML', element)
			return string;
		} catch(e) {
			return null
		}
	}

	this.getAllFeedPosts = async function() {

		const postsBy = By.css('#siteTable .thing')
		let postElements = [];
		try {
			postElements = await this.driver.findElements(postsBy);
		} catch(e) {
			// console.log(e);
		}

		return postElements;
	}

	this.getOPPost = async function() {
		const opPostBy = By.css('#siteTable .thing')
		const opPostEl = await this.driver.findElement(opPostBy);

		return await opPostEl
	}

	this.getTopLevelComments = async function() {
		// returns list of contentTrees
		const topLevelCommentsBy = By.css('.sitetable.nestedlisting > .comment')
		const topCommentElements = await this.driver.findElements(topLevelCommentsBy);
		return topCommentElements;
	}
}

RedditScraper.prototype.scrape = async function() {
	this.driver.get(this.seedUrl)

	const HTMLContentMapping = {
		'text-post': [],
		'text-feed-item': [],
		'comment': []
	}

	if (this.isPost) {
		const postEl = await this.getOPPost()
		if (postEl) {
			HTMLContentMapping['text-post'].push(await this.getElementHTML(postEl));
		}
		const topLevelComments = await this.getTopLevelComments() 
		for (let comment of topLevelComments) {
			HTMLContentMapping['comment'].push(await this.getElementHTML(comment));
		}
	} else { // assume feed page
		const feedPostsElements = await this.getAllFeedPosts()
		
		for (let [i, feedPostEl] of feedPostsElements.entries()) {
			HTMLContentMapping['text-feed-item'].push(await this.getElementHTML(feedPostEl));
		}
	}


	return HTMLContentMapping
}

module.exports = RedditScraper;