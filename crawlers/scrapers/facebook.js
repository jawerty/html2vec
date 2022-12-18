const { By, Key, until } = require('selenium-webdriver');
const { timeout } = require('../utils/selenium');
const { generateRandomId,
	getChecksumFromString,
	getMiliSecondsFromTimeString } = require('../utils/general');

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

function FacebookScraper(driver, seedUrl, options) {
	this.driver = driver;
	this.seedUrl = seedUrl;
	const seedUrlObj = new URL(this.seedUrl)
	this.isPost = seedUrlObj.pathname.includes('/comments/')
	
	this.loginInfo = options.loginInfo;

	this.HTMLContentMapping = {};

	this.commentHashMap = {};
	this.articleHashMap = {};
	this.newArticleCheckIterator = 0;
	this.newArticleCheckTimeout = 5;
	this.articleLimit = 10;
	this.articleCounter = 0;
		
	this.getElementHTML = async function(element) {
		try {
			const string = await this.driver.executeScript('return arguments[0].outerHTML', element)
			return string;
		} catch(e) {
			return null
		}
	}


	this.getTopLevelComments = async function(article, isTopLevel) {
	    let commentBy;
	    if (isTopLevel) {
	        commentBy = By.css("div[role='article'][aria-label*='Comment by']")
	    } else {
	        commentBy = By.css("div[role='article'][aria-label*='Reply by']")

	    }

	    let topLevelComments;
	    try {
	        topLevelComments = await article.findElements(commentBy)
	    } catch (e) {
	        return true;
	    }

	    // filter
	    const filteredComments = []
	    for (let comment of topLevelComments) {
	    	const commentId = await comment.id_;
	    	if (commentId in this.commentHashMap) {
	            continue;
	        }

	       	this.commentHashMap[commentId] = true;
	    	filteredComments.push(comment)
	    }
	    console.log("Found", filteredComments.length, "new comments");

	    return filteredComments;

	  
	}

	this.getFacebookPosts = async function(currentTime, HTMLContentMapping) {
		if (this.articleCounter >= this.articleLimit) {
			return HTMLContentMapping
		}
	    let articles;
	    try {
	        await timeout(2000);
	        articles = await this.driver.findElements(By.css("div[role='main'] div div div div[aria-posinset][aria-describedby][aria-labelledby]"));
	    } catch (e) {
	        console.log(e);
	        return true;
	    }
	    console.log('Found articles', articles.length);
	    let newArticleFound = false;
	    for (let article of articles) {
	        if (await article.id_ in this.articleHashMap) {
	            continue;
	        }
	        newArticleFound = true;
	        console.log("start new article");
	        this.articleCounter += 1;
	        const articleHTMLString = await this.getElementHTML(article)
	        if (!articleHTMLString) {
	        	continue;
	        }
	        
	        HTMLContentMapping['text-post'].push(articleHTMLString)
	        console.log("articleHTMLString", articleHTMLString.substring(0, 100))
	        this.articleHashMap[await article.id_] = true;
	        const commentFormBy = By.css("form")
	       

	        // all top level comments

	        const initialComments = await this.getTopLevelComments(article, true);

	        let commentHTMLStrings = []
	        for (let comment of initialComments) {
	        	const commentHTMLString = await this.getElementHTML(article);
	        	console.log("commentHTMLString", commentHTMLString.substring(0, 100))

	        	if (commentHTMLString) {
	        		commentHTMLStrings.push(commentHTMLString)
	        	}
	        }
	        HTMLContentMapping['comment'] = HTMLContentMapping['comment'].concat(commentHTMLStrings)

	        if (initialComments.length > 0) {
		        const commentRecursion = async () => {
		            const moreComments = await this.getTopLevelComments(article, false)
		            console.log("top comment recursion")
		            if (moreComments.length > 0) {
		            	const moreCommentHTMLStrings = []
		            	for (let comment of moreComments) {
				        	const commentHTMLString = await this.getElementHTML(article);
				        	console.log("commentHTMLString", commentHTMLString.substring(0, 100))
							if (commentHTMLString) {
				        		moreCommentHTMLStrings.push(commentHTMLString)
				        	}
				        }
				        commentHTMLStrings = commentHTMLStrings.concat(moreCommentHTMLStrings);
		            }

		            let viewMoreComments;
		            try {
		                viewMoreComments = await article.findElement(By.xpath(".//span[contains(@dir,'auto')][contains(text(), ' more comments')]"));

		                await viewMoreComments.click()
		                await timeout(5000);
		                return await commentRecursion();
		            } catch (e) {
		                console.log("No more comments");
		                // console.log(e);
		                return true;
		            }
		        }

		        await commentRecursion()
	    	}	
		

	    }

	    if (!newArticleFound) {
	        this.newArticleCheckIterator += 1;
	        if (this.newArticleCheckIterator >= this.newArticleCheckTimeout) {
	            this.newArticleCheckIterator = 0;
	            return HTMLContentMapping 
	        }
	    }
	    await this.driver.executeScript('window.scrollBy(0,5000)');
	    await timeout(5000);
	    return await this.getFacebookPosts(currentTime, HTMLContentMapping);
	}

	this.commentFetchRoutine = async function() {
		this.HTMLContentMapping = []
	    const currentTime = new Date();

	    const articleBy = By.css("div[role='main'] div div div div[aria-posinset][aria-describedby][aria-labelledby]");
	    await this.driver.wait(until.elementLocated(articleBy, 10));

	    return await this.getFacebookPosts(currentTime, {
	    	'text-post': [],
	    	'comment': []
	    });
	}

	this.login = async function() {
		const username = this.loginInfo.username;
		const password = this.loginInfo.password
	    console.log("logging into facebook...")
	    this.driver.get('https://www.facebook.com')
	    const emailBy = By.css("input[name=\"email\"]");
	    await this.driver.wait(until.elementLocated(emailBy, 100));
	    const emailInput = await this.driver.findElement(emailBy);
	    emailInput.sendKeys(username);

	    const passwordBy = By.css("input[type=\"password\"]");
	    const passInput = await this.driver.findElement(passwordBy);
	    passInput.sendKeys(password);

	    const buttonBy = By.css("button");
	    const buttonInput = await this.driver.findElement(buttonBy);
	    buttonInput.click();

	    await timeout(2000);
	}
		
}





FacebookScraper.prototype.scrape = async function() {
	this.driver.get(this.seedUrl)


	this.HTMLContentMapping = await this.commentFetchRoutine()
	console.log(this.HTMLContentMapping);

	return this.HTMLContentMapping
}


module.exports = FacebookScraper;