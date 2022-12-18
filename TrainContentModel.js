const brain = require('brain.js');
const fs = require('fs');


const buildTrainingSet = (inputs) => {
  const trainingSet = [];


  let mergedInputs;
  if (Object.keys(inputs).length === 1) {
    mergedInputs = Object.values(inputs)[0];
  } else {
    mergedInputs = Object.values(inputs).reduce((prev, curr) => {
      return prev.concat(curr);
    });
  }

  // flatten
  mergedInputs = mergedInputs.map((input) => {
    return input.flat();
  });

  let largestInputSize = mergedInputs.reduce((prev, curr) => {
    const prevIsNumber = (typeof prev === "number");
    if (!prevIsNumber) {
      prev = prev.length
    }
    return (prev > curr.length) ? prev : curr.length;
  });

  // pad the matrixes
  for (let contentType of Object.keys(inputs)) {
    for (let input of inputs[contentType]) {
      input = input.flat();// flatten
      const inputDiff = (largestInputSize - input.length)
      if (inputDiff > 0) {
        for (let i = 0; i < inputDiff; i++) {
          input.push(0)
        }
      }
      trainingSet.push({
        input, 
        output: { [contentType]: 1 }
      });

    }
  }
  return trainingSet;
}


const readInputs = (inputDir) => {
  const filenames = fs.readdirSync(inputDir);

  const inputs = {};
  let lastInput;
  for (let filename of filenames) {
    const filenameSplit = filename.split('.');
    let contentType;
    for (let i = 0; i < filenameSplit.length; i++) {
      if (filenameSplit[i] === 'html') {
        contentType = filenameSplit[i-1]
        if (!inputs[contentType]) {
          inputs[contentType] = [] // preload with empty array
        }
        break;
      } 
    }
    if (!contentType) {
      console.log("filename broke!", filename);
      continue;
    }

    try {
      const inputFileContent = JSON.parse(fs.readFileSync(inputDir + filename, 'utf-8'));
      lastInput = inputFileContent.input
      inputs[contentType].push(inputFileContent.input);
    } catch(e) {
      console.log(e);
    }
  }


  return inputs;

} 

const run = ( ) => {
  const inputDir = './inputs/';
  console.log("Reading inputs...")
  let inputs = readInputs(inputDir)

  console.log("Transforming inputs to training set...")
  const trainingSet = buildTrainingSet(inputs);

  const inputSize = trainingSet[0].input.length
  const dimensionSize = 36


  console.log('\n')
  console.log("---- Training Set INFO ----")
  console.log("Amount of input(s):", trainingSet.length)
  console.log("Input Size:", inputSize)
  console.log("Dimension Count:", dimensionSize)
  console.log('---------------------------')
  console.log('\n')


  const config = {
    iterations: 200,
    binaryThresh: 0.5,
    inputSize,
    log: true,
    logPeriod: 10,
    hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
    activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
  };

  // create a simple feed forward neural network with backpropagation
  const net = new brain.NeuralNetwork(config);
  net.maxPredictionLength = 1000000000;


  try {
    console.log("Training...")

    console.time("Training Successful!");
    net.train(trainingSet);
    console.timeEnd("Training Successful!")
    
    const newModelFile = `${'content-model-'}${(new Date().getTime())}.json`;
    const json = net.toJSON();
    fs.writeFileSync(`./models/${newModelFile}`, JSON.stringify(json), 'utf-8')
    console.log("Saved Model to", `./models/${newModelFile}`)

  } catch(e) {
    console.log(e)
    console.log("Training Unsuccessful!")
    process.exit(1)
  }
  
}

run()

