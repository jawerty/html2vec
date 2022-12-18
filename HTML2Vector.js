const fs = require('fs');
const { ArgumentParser } = require('argparse');
const { spawn } = require('child_process');

async function run() {
  const parser = new ArgumentParser({
	  description: 'HTML2Vector algo'
  });
	 
  parser.add_argument('-v', '--version', { action: 'version', version: "0.0.1" });
  parser.add_argument('-i', '--html-corpus', { help: 'path to html corpus directory' });
  parser.add_argument('-o', '--output-dir', { help: 'path to directory to save inputs' });


  const args = parser.parse_args()

  const tmpDir = './tmp/' 
  let corpus_dir = './html_corpus/'
  let outputDir = './inputs';

  if (args.html_corpus) {
	corpus_dir = args.html_corpus
  }
  if (args.output_dir) {
	outputDir = args.output_dir
  }


  const processEdgelistFile = (filename) => {
  	return new Promise((resolve, reject) => {
  		const outputFile = tmpDir + filename + '.edgelist'
  		const HTML2EdgelistCmd = spawn('node', ['HTML2EdgeList.js', '-i',  corpus_dir + filename, '-o', outputFile, '-n']);

		HTML2EdgelistCmd.stdout.on('data', (data) => {
		  console.log(`stdout: ${data.trim()}`);
		});

		HTML2EdgelistCmd.stderr.on('data', (data) => {
		  reject()
		});

		HTML2EdgelistCmd.on('close', (code) => {
		  resolve(outputFile)
		});
  	})
  }

  const processNode2Vec = (edgelistFile) => {
  	const embeddingsFile = edgelistFile.split('.edgelist')[0] + '.embeddings.txt'
  	return new Promise((resolve, reject) => {
  		const Node2VecCmd = spawn('python3', ['node2vec/src/main.py', '--input',  edgelistFile, '--p', 0.1, '--q', 2, '--walks', 10, '--length', 10, '--d', 24, '--output', embeddingsFile ]);

		// Node2VecCmd.stdout.on('data', (data) => {
		//   console.log(`stdout: ${data}`);
		// });

		Node2VecCmd.stderr.on('data', (data) => {
		  console.log(`stderr: ${data}`);
		  reject()
		});

		Node2VecCmd.on('close', (code) => {
		  console.log("Node2Vec dimensions generated")
		  resolve(embeddingsFile)
		});
  	})
  }

  const processVectorization = (embeddingsFile, nodeIdJsonFile) => {
  	return new Promise((resolve, reject) => {
  		const VectorizeHTMLEmbeddingCmd = spawn('node', ['VectorizeHTMLEmbedding.js', '-i',  embeddingsFile, '-o', outputDir, '-n', nodeIdJsonFile ]);

		VectorizeHTMLEmbeddingCmd.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		});

		VectorizeHTMLEmbeddingCmd.stderr.on('data', (data) => {
		  console.log(`stderr: ${data}`);

		  reject()
		});

		VectorizeHTMLEmbeddingCmd.on('close', (code) => {
		  resolve()
		});
  	})
  }

  const filenames = fs.readdirSync(corpus_dir);
  console.time("Processing Time");
  for (let filename of filenames) {
  	console.log("Generating HTML embedding for", filename)
  	let edgelistFile;
  	try {
  		edgelistFile = await processEdgelistFile(filename)

  	} catch(e) {
  		console.log(e)
  		console.log('processEdgelistFile failed')
  		process.exit(1);
  	}

  	let embeddingsFile;
  	try {
  		embeddingsFile = await processNode2Vec(edgelistFile)
  	} catch(e) {
  		console.log(e);
  	}

  	try {
  		await processVectorization(embeddingsFile, edgelistFile+'.json')
  	} catch(e) {
  		console.log(e);
  	}
  	console.log("HTML embedding generated\n\n")
  }
  console.timeEnd("Processing Time")
  console.log('Embeddings created', filenames.length)
}

run()