// inputs html embedding and nodeId => mapping json
const { ArgumentParser } = require('argparse');
const fs = require('fs');


function HTMLNameConverter(htmlName) {
	const charCodes = []
	for (let i = 0; i < htmlName.length; i++) {
		charCodes.push(htmlName.charCodeAt(i))
	}
	return parseInt(charCodes.join(''));
}

async function run() {
	// get html embedding and edgelist json
	// read file and process with edgelist json
		// add additional dimensions based on element info (classnames for instance)
	// output vectors into input matrix [[]] and save to inputs file in inputs folder
		// test.html.json
			// { input: [matrix] }

	const parser = new ArgumentParser({
	  description: 'Vectorize HTML'
	});
	 
	parser.add_argument('-v', '--version', { action: 'version', version: "0.0.1" });
	parser.add_argument('-i', '--input', { help: 'path to HTML embedding txt file' });
	parser.add_argument('-o', '--output-dir', { help: 'path to output directory' });
	parser.add_argument('-n', '--nodeInfoJson', { help: 'path to node info json file ' });
	
	const args = parser.parse_args()

	if (!args.input) {
		console.log("You need to specify an HTML edgelist file")
		process.exit(0)
	}
	if (!args.output_dir) {
		console.log("You need to specify an output directory")
		process.exit(0)
	}
	if (!args.nodeInfoJson) {
		console.log("You need to specify an node info json file")
		process.exit(0)
	}


	const HTMLEmbeddings = await fs.readFileSync(args.input, 'utf-8').toString().split('\n')
	const nodeInfo = JSON.parse(await fs.readFileSync(args.nodeInfoJson, 'utf-8'))

	HTMLEmbeddings.shift() // remove descriptive line in embedding file

	const HTMLVector = HTMLEmbeddings.filter((nodeEmbedding) => {
		return (nodeEmbedding.length > 0)
	}).map((nodeEmbedding) => {
		dimensions = nodeEmbedding.split(' ')
		
		// parse out the nodeId which is the first column
		const nodeId = dimensions.shift()

		// convert from string to float
		dimensions = dimensions.map((dimension) => {
			return parseFloat(dimension)
		})
		// Vector format
		return [
			nodeInfo[nodeId].tagNameIndex, 
			+nodeInfo[nodeId].hasId, 
			+nodeInfo[nodeId].hasClass, 
			+nodeInfo[nodeId].hasText, 
			+nodeInfo[nodeId].isSemantic, 
			+nodeInfo[nodeId].hasAria, 
			nodeInfo[nodeId].dataPropCount,  
			...dimensions
		]
	})

	fs.writeFileSync(`${args.output_dir}${args.input.split('/')[args.input.split('/').length-1]}.json`, JSON.stringify({
		input: HTMLVector
	}))
}

run()