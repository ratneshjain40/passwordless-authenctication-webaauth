const express = require("express");
const cors = require("cors");

//-------------- Import Routes and config ----------------

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const connectDb = require("./utils/connectDb");
const db = connectDb();

const auth = require("./routes/auth");
const webauthn = require("./routes/webauthn");
const error = require("./middlewares/error");

//-------------- GENERAL SETUP ----------------

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//-------------- Routes Middleware ----------------

app.use("/auth", auth);
app.use("/webauthn", webauthn);

//-------------- Error Middleware ----------------

app.use(error);

//-------------- Run Server ----------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
