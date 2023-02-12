const cheerio = require('cheerio');
const { ArgumentParser } = require('argparse');
const fs = require('fs');

const nodeInfo = {};

const tagNameIndex = JSON.parse(fs.readFileSync('./tagNameIndex.json', 'utf-8'));

let saveNodeInfo = false;

const getTagNameIndex = (tagName) => {
	if (tagName in tagNameIndex) {
		return parseInt(tagNameIndex[tagName]); // parseInt just in case
	} else {
		//
		const newIndex = Object.keys(tagNameIndex).length;
		tagNameIndex[tagName] = newIndex;
		fs.writeFileSync('./tagNameIndex.json', JSON.stringify(tagNameIndex), 'utf-8')
		return newIndex;
	}
}

const fetchNodeInfo = ($, node) => {
	const semanticElementList = [
		"article",
		"aside",
		"details",
		"figcaption",
		"figure",
		"footer",
		"header",
		"main",
		"mark",
		"nav",
		"section",
		"summary",
		"time"
	];
	const formElementList = [
		"select",
		"input",
		"button",
		"textarea",
		"form",
		"label",
		"fieldset",
		"legend",
		"datalist",
		"option",
		"output",
		"optgroup",
	]
	const headerElementList = [
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6'
	]
	const id = $(node).attr('id');
	const classes = $(node).attr('class');
	const attributes = Object.values(node.attributes).map((attr) => attr.name)
	
	let dataPropCount = 0;
	let hasAria = false;
	if (attributes && attributes.length > 0) {
		for (let attribute of attributes) {
			if (attribute.indexOf('data-') === 0) {
				dataPropCount++;
			} else if (!hasAria && attribute.indexOf('aria-') === 0) {
				hasAria = true;
			}
		}
	}

  	const hasText = [...node.childNodes]
      .some(n => n.nodeType === 3 // 3 is a text node
            && n.nodeValue.trim() !== '');

	return {
		tagNameIndex: getTagNameIndex(node.name),
		hasId: !!id,
		hasClass: !!classes,
		hasText,
		isSemantic: semanticElementList.includes(node.name),
		dataPropCount,
		hasAria,
		isFormElement: formElementList.includes(node.name),
		isHeaderElement: headerElementList.includes(node.name),
	}
}

const getEdges = ($, node, parentNodeId, edgeAccumulation) => {
	const children = $(node).children();
	if (saveNodeInfo) {
		nodeInfo[parentNodeId] = fetchNodeInfo($, node); 
	}
	if (children.length > 0) {
		let nextNodeId = parentNodeId+1
		for (let child of children) {
			edgeAccumulation.push(`${parentNodeId} ${nextNodeId}`);
			const newEdges = getEdges($, child, nextNodeId, [])
			edgeAccumulation = edgeAccumulation.concat(newEdges)
			nextNodeId += newEdges.length + 1 // use children length plus one
		}		
	}

	return edgeAccumulation
}


// must have one root node to create edge list
async function HTMLToEdgelistArray(htmlString) {
	const $ = cheerio.load(htmlString);
	const rootNode = $('*')[0];
	const edges = getEdges($, rootNode, 0, []);
	return edges;
}

async function run() {
	const parser = new ArgumentParser({
	  description: 'Convert html file to edgelist file'
	});
	 
	parser.add_argument('-v', '--version', { action: 'version', version: "0.0.1" });
	parser.add_argument('-i', '--input', { help: 'path to HTML file' });
	parser.add_argument('-o', '--output', { help: 'path to edgelist file ' });
	parser.add_argument('-n', '--nodeInfo', { help: 'Save JSON file with node info', action:'store_true' });
	
	
	const args = parser.parse_args()

	if (!args.input) {
		console.log("You need to specify an HTML input file")
		process.exit(0)
	}
	if (!args.output) {
		console.log("You need to specify an edgelist output file")
		process.exit(0)
	}
	saveNodeInfo = !!args.nodeInfo
	const htmlContent = fs.readFileSync(args.input, 'utf-8')
	const edgeListArray = await HTMLToEdgelistArray(htmlContent, saveNodeInfo)
	
	const outputFile = fs.createWriteStream(args.output);
	outputFile.on('error', function(err) { console.log(err) });
	for (let edge of edgeListArray) {
 		outputFile.write(edge+ '\n')
	}
	outputFile.end();

	// the finish event is emitted when all data has been flushed from the stream
	outputFile.on('finish', () => {
	   if (saveNodeInfo) {
			fs.writeFileSync(`${args.output}.json`, JSON.stringify(nodeInfo, null, 2), 'utf-8')
		}

		console.log(`Wrote ${edgeListArray.length} edges to ${args.output}`)
		process.exit(0);
	});
}


run();