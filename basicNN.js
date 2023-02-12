console.log("Importing danfo")
const dfd = require("danfojs-node")
const { train_test_split } = require('machinelearn/model_selection');

const run = async () => {
	let df = await dfd.readCSV("./heart.dat", { delimiter: " ", header: true })
	const X = df.drop({ columns: ["heart_disease"]});

	df = df.replace(1, 0, { columns: ["heart_disease"] })
	df = df.replace(2, 1, { columns: ['heart_disease'] })

	const y_label = df['heart_disease'].values.reshape(X.shape[0], 1)
	const result = train_test_split(X, y_label, test_size=0.2, random_state=2)
	console.log(result);

}


run();