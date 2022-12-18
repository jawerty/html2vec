const fs = require('fs');
const cheerio = require('cheerio');
const w2v = require('word2vec');

const getTextSeriesFromHTMLNode = ($, node, currentAccumulator, overallAccumulator) => {
	// currentAccumulator += `${node.name} `;
	const children = $(node).children();
	if (children.length > 0) {
		for (let child of children) {
			// console.log("node.name", node.name)
			// console.log(child.name)
			[newAccumulator] = getTextSeriesFromHTMLNode($, child, `${child.name} `, overallAccumulator)
			currentAccumulator += newAccumulator;
		}		
	}
	overallAccumulator += currentAccumulator;

	return [currentAccumulator, overallAccumulator]
}

const run = () => {

	const inputHTML = fs.readFileSync('./input.html', "utf8");

	const $ = cheerio.load(inputHTML);

	const rootNode = $('html')
	const [currentAccumulator, overallAccumulator] = getTextSeriesFromHTMLNode($, rootNode[0], '', '');
	const finalText = 'html ' + overallAccumulator;
	fs.writeFileSync('output.txt', finalText)
	console.log('output.txt written');
}


run();