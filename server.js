import express, { json, urlencoded } from "express";
import cors from "cors";

//-------------- Import Routes and config ----------------

import { config } from "dotenv";
config({ path: "./config/config.env" });

import connectDb from './db/connectDb.js';
const db = connectDb();

import auth from './routes/auth.js';
import webauthn from './routes/webauthn.js';
import proxyauth from './routes/proxyauth.js';
import error from './middlewares/error.js';

//-------------- GENERAL SETUP ----------------

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(json());
app.use(urlencoded({ extended: true }));

//-------------- Routes Middleware ----------------

app.use("/auth", auth);
app.use("/webauthn", webauthn);
app.use("/proxy", proxyauth);

//-------------- Error Middleware ----------------

app.use(error);

//-------------- Run Server ----------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
