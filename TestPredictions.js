const brain = require('brain.js');
const fs = require('fs');

const run = () => {
    const model = JSON.parse(fs.readFileSync('./models/content-model-1671388781839.json', 'utf-8'))
	const inputSize = model["sizes"][0]

    const net = new brain.NeuralNetwork();
    net.maxPredictionLength = 1000000000;
    net.fromJSON(model)

	const testInputDir = "./test_inputs/";
	const filenames = fs.readdirSync(testInputDir);
	for (let filename of filenames) {
		const testInputFile = JSON.parse(fs.readFileSync(testInputDir + filename, "utf-8"));
		const input = testInputFile.input.flat();
	    const inputDiff = (inputSize - input.length)
        if (inputDiff > 0) {
          for (let i = 0; i < inputDiff; i++) {
            input.push(0)
          }
        }
		const output = net.run(input)
		console.log(filename, output);
	}
}

run();