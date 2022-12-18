const { By, Key, until } = require('selenium-webdriver');
const { timeout } = require('../utils/selenium');
const { generateRandomId } = require('../utils/general');
const fs = require('fs');
const path = require('path');
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
	outboundLink
}
*/

function GenericScraper(driver, seedUrl) {
	this.driver = driver;
	this.seedUrl = seedUrl;
	const seedUrlObj = new URL(this.seedUrl)

	this.contentTrees = [];

	this.fetchReadabilityInfo = async function() {
		let readabilityInfo = {};
		const readabilityJsContent = fs.readFileSync(path.join(__dirname, '../Readability.js'), 'utf-8');
		try {
			await this.driver.executeScript(readabilityJsContent);
			readabilityInfo = await driver.executeScript('return new Readability(document.cloneNode(true)).parse();');
		} catch(e) {
			console.log(e)
		}

		return readabilityInfo;
	}

	this.getOPPost = async function() {
		let title, textContent;

		try {
			const titleBy = By.css('meta[property="og:title"]')
			await driver.wait(until.elementLocated(titleBy, 10));
			const titleElement = await this.driver.findElement(titleBy);
			title = await titleElement.getAttribute('content');
		} catch(e) {
			// console.log(e);
		}
		
		try {
			const descriptionBy = By.css('meta[property="og:description"]')
			await driver.wait(until.elementLocated(descriptionBy, 10));
			const descriptionElement = await this.driver.findElement(descriptionBy);
			textContent = await descriptionElement.getAttribute('content');
		} catch(e) {
			// console.log(e);
		}

		const readabilityInfo = await this.fetchReadabilityInfo()
		if (!title && readabilityInfo.title) {
			title = readabilityInfo.title.trim()
		}
		if (readabilityInfo.textContent) {
			textContent = readabilityInfo.textContent.trim().replace(/\s\s+/g, ' ');;
		}
		console.log({
			id: generateRandomId(this.seedUrl, title),
			title,
			textContent,
			isArticle: !!readabilityInfo.byline,
			url: this.seedUrl,
			platform: 'anonymous',
			isSubContent: false,
		});
		return {
			id: generateRandomId(this.seedUrl, title),
			title,
			textContent,
			url: this.seedUrl,
			platform: 'anonymous',
			isSubContent: false,
		}
	}
}

GenericScraper.prototype.scrape = async function() {
	// fix this patch
	if (['pdf','jpg','gif','png','svg','mp4','mp3'].includes(
		this.seedUrl.split('.')[this.seedUrl.split('.').length-1])
	) {
		return [] 
	}

	this.driver.get(this.seedUrl)

	const rootContentNode = await this.getOPPost()
	if (!rootContentNode.title) return [];
	rootContentNode.children = [];
	return [rootContentNode]
}

module.exports = GenericScraper;