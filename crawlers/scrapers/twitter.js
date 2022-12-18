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

function TwitterScraper(driver, seedUrl) {
	this.driver = driver;
	this.seedUrl = seedUrl;
	const seedUrlObj = new URL(this.seedUrl)
	this.isPost = seedUrlObj.pathname.includes('/status/')
	// else assume user page and fetch feed (end scraping if no feed)

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
		const postsBy = By.css('[data-testid="tweet"]')
		let postElements = [];
		try {
			await driver.wait(until.elementLocated(postsBy, 10));
			postElements = await this.driver.findElements(postsBy);
		} catch(e) {
			// console.log(e);
		}

		return postElements;
	}

	this.getOPPost = async function() {
		const opPostBy = By.css('[data-testid="tweet"]')
		await driver.wait(until.elementLocated(opPostBy, 10));

		const allTweets = await this.driver.findElements(opPostBy);

		let opPostEl
		let opPostIndex
		for (let [i, tweet] of allTweets.entries()) {
			try {
				const timeBy = By.css('a time')
				const timeElement = await tweet.findElement(timeBy);
				linkElement = await this.driver.executeScript("return arguments[0].closest('a')", timeElement)
				const url = await linkElement.getAttribute('href');
				if (url === this.seedUrl) {
					console.log("Found OP tweet")
					opPostEl = tweet
					opPostIndex = i
					break;
				} else {
					console.log(url, this.seedUrl)
				}
			} catch(e) {
				// console.log(e);
			}

		}

		if (!opPostEl) {
			return [null, null]
		}

		return [opPostEl, opPostIndex];

	}

	this.getTopLevelComments = async function(opPostIndex) {
		// returns list of contentTrees
		const topLevelCommentsBy = By.css('[data-testid="tweet"]')
		await driver.wait(until.elementLocated(topLevelCommentsBy, 10));
		const topCommentElements = await this.driver.findElements(topLevelCommentsBy);

		const topLevelComments = [];
		for (let [i, topCommentElement] of topCommentElements.entries()) {
			if (opPostIndex === i) {
				continue;
			}
	
			topLevelComments.push(topCommentElement);

		}

		return topLevelComments;
	}
}

TwitterScraper.prototype.scrape = async function() {
	this.driver.get(this.seedUrl)
	const HTMLContentMapping = {
		'text-feed-item': []
	}

	if (this.isPost) {
		const [postEl, postIndex] = await this.getOPPost()
		if (postEl) { // Couldn't find post (it broke)
			HTMLContentMapping['text-feed-item'].push(await this.getElementHTML(postEl));
		}
	} else { // assume feed page
		const feedPostsElements = await this.getAllFeedPosts()
		
		for (let [i, feedPostEl] of feedPostsElements.entries()) {
			HTMLContentMapping['text-feed-item'].push(await this.getElementHTML(feedPostEl));
		}
	}


	return HTMLContentMapping
}

module.exports = TwitterScraper;