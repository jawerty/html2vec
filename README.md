# html2vec (WIP)
Vectorize HTML files and generate embeddings with structural and semantic expression

# Technologies
- Node.js
	- `HTML2EdgeList.js` - cli tool for converting the HTML file to an .edgelist representation
	- `VectorizeHTMLEmbeddings.js` - Use node2vec dimensions and various dimensions found from the edgelist conversion to generate a matrix with vectors for each node in the HTML tree.
	- `HTML2Vector.js` - cli tool that builds the entire embedding pipleine
- Python (Version 3)
	- For running `node2vec/main.py` - cli tool generating node2vec dimensions from .edgelist files
		- Using cli tool by apoorvavinod https://github.com/apoorvavinod/node2vec
	- `Brain.js` for Neural Network 

# Install
Node.js setup
```
$ npm install
```

Python setup
```
$ cd node2vec
# set up virtualenv if you'd like 
$ pip install -r requirements.txt
```

# Usage

Run pipeline
```
node HTML2Vector.js -i ./html_corpus/ -o ./inputs/

/*
HTML2Vector.js
	-i = "Directory with html files" 
	-o = "Output folder where you want to store your embeddings"
*/
```
