import Redis from "ioredis";

import { config } from "dotenv";
config({ path: "./config/config.env" });

let redisClient = new Redis(path = process.env.REDIS_URL);

export default redisClient;