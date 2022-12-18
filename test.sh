node HTML2EdgeList.js  --input test.html --output output.edgelist --nodeInfo
python3 node2vec/src/main.py --input ./output.edgelist --p 0.4 --q 1 --walks 20 --length 80 --d 256 --output embeddings.txt
node VectorizeHTMLEmbedding.js -i ./embeddings.txt -n ./output.edgelist.json