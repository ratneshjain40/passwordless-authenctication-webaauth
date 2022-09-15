import { Client } from "redis-om";

import { config } from "dotenv";
config({ path: "./config/config.env" });

const url = process.env.REDIS_URL;

const client = await new Client().open(url)

export default client;