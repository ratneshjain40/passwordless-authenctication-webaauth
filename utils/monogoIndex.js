import { MongoClient } from "mongodb";

import { config } from "dotenv";
config({ path: "./config/config.env" });

const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);

async function createIndex(db, collections, index) {
	try {
		await client.connect();

		const database = client.db(db);
		const indexing = await database
			.collection(collections)
			.createIndex(index, { unique: true });
	} finally {
		await client.close();
	}
}

export default createIndex