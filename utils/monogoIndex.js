const { MongoClient } = require("mongodb");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);

async function createIndex(index) {
	try {
		await client.connect();

		const database = client.db("supply-mgmt");
		const movies = await database
			.collection("items")
			.createIndex(index, { unique: true });

		// Query for a movie that has the title 'Back to the Future'
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}

module.exports = createIndex