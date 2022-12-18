const fs = require('fs');

const RedditScraper = require('./scrapers/reddit.js');
const TwitterScraper = require('./scrapers/twitter.js');
const YoutubeScraper = require('./scrapers/youtube.js');
const GenericScraper = require('./scrapers/generic.js');
const HackerNewsScraper = require('./scrapers/hackernews.js');
const FacebookScraper = require('./scrapers/facebook.js');
const { setupDriver } = require('./utils/selenium.js');

const { 
	getChecksumFromString
} = require('./utils/general');


const config = JSON.parse(fs.readFileSync('./config.json'))

function getOutboundLinksFromContentTree(contentTree) {
	function getOutboundLinkFromContentNode(contentNode, outboundLinksObject) {
		if (contentNode.outboundLink && typeof contentNode.outboundLink === "string") {
			outboundLinksObject[contentNode.id] = contentNode.outboundLink
		}
		if (contentNode.children && contentNode.children.length > 0) {
			for (let contentNodeChild of contentNode.children) {
				const childOutboundLinksObject = getOutboundLinkFromContentNode(contentNodeChild, outboundLinksObject)
				outboundLinksObject = Object.assign(outboundLinksObject, childOutboundLinksObject);
			}
		}

		return outboundLinksObject
	}

	return getOutboundLinkFromContentNode(contentTree, {})
}

async function Crawler() {
	async function crawl(seedUrl) {
		/* 
			crawl scrapes a url to find content nodes, 
			stores content nodes in graph database,
			and re-runs crawl for each outbound content link  
		*/
		console.log("Crawling from seed url:", seedUrl)
		const seedUrlObj = new URL(seedUrl);

		let newScraper;
		const isReddit = seedUrlObj.hostname.includes('reddit.com');
		const isTwitter = seedUrlObj.hostname.includes('twitter.com');
		const isYoutube = seedUrlObj.hostname.includes('youtube.com');
		const isHN = seedUrlObj.hostname.includes('news.ycombinator.com')
		const isFacebook = seedUrlObj.hostname.includes('facebook.com')
		if (isReddit) {
			newScraper = new RedditScraper(driver, seedUrl);
		} else if (isTwitter) {
			newScraper = new TwitterScraper(driver, seedUrl);
		} else if (isYoutube) {
			newScraper = new YoutubeScraper(driver, seedUrl);
		} else if (isHN) {
			newScraper = new HackerNewsScraper(driver, seedUrl);
		} else if (isFacebook) {
			newScraper = new FacebookScraper(driver, seedUrl, {
				loginInfo: {
					username: config.fbUsername,
					password: config.fbPassword
				}
			});
		} else {
			console.log("generic scraper?", seedUrlObj.hostname)
			process.exit(1)
			// no 
			newScraper = new GenericScraper(driver, seedUrl);
		}

		if (newScraper.loginInfo) {
			await newScraper.login();
		}
		let HTMLContentMapping = await newScraper.scrape(); // many for feed pages and one for post pages
		const outBoundLinks = []
		/*
			HTMLContentMapping = {
				'text-post'; [
					'<html-string>'
				],
				'comment': [
					'<html-string>'
				]
			}
		*/

		const totalContentItemsCount = Object.values(HTMLContentMapping).reduce((prev, curr) => {
			return ((prev.length) ? prev.length : prev) + curr.length
		});
		console.log("Content Items Found", totalContentItemsCount);
		if (totalContentItemsCount === 0) {
			return;
		} 


		// if (newScraper.hasRecommended) { // don't get recommended from recommended videos (avoid endless scraping)
		// 	console.log("Finding recommended content")
		// 	const HTMLContentMappingRec = await newScraper.getRecommendedContentTrees();
		// 	const totalContentItemsCountRec = Object.values(HTMLContentMappingRec).reduce((prev, curr) => {
		// 		return prev + curr.length
		// 	});
		// 	console.log("Found", totalContentItemsCountRec, "recommended nodes")
		// 	for (contentType of Object.keys(HTMLContentMappingRec)) {
		// 		HTMLContentMapping[contentType] = HTMLContentMapping[contentType].concat(HTMLContentMappingRec[contentType])
		// 	}
		// }
		// dedup outbound links
		// store files

		for (let contentType of Object.keys(HTMLContentMapping)) {
			for (let HTMLString of HTMLContentMapping[contentType]) {
				const fileName = getChecksumFromString(HTMLString);
				let urlSplit = seedUrlObj.hostname.split('.');
				urlSplit = urlSplit.slice(0, urlSplit.length-1);
				if (urlSplit[0] === 'www') {
					urlSplit.shift()
				}

				const domain = urlSplit.join('.');
				fs.writeFileSync(`../html_corpus/${domain}-${fileName}.${contentType}.html`, HTMLString, 'utf-8');
			}
		}

		console.log("Outbound links found", outBoundLinks.length);
		const crawledOutboundLinks = [];
		for (let outBoundLink of outBoundLinks) {
			if (crawledOutboundLinks.includes(outBoundLink)) {
				continue; // deduping the outbound links
			} else if (outBoundLink === seedUrl) {
				continue; // don't go to the same url
			}
			console.log("seeding outbound link...")
			await crawl(outBoundLink);
			crawledOutboundLinks.push(outBoundLink);
		}

		return;
	}

	const seedUrls = fs.readFileSync('./seeds.txt', "utf-8").trim().split('\n')

	const driver = await setupDriver();

	for (let seedUrl of seedUrls) {
		await crawl(seedUrl);
	}
}

Crawler();