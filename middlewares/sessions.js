import session from "express-session";
// var MongoDBStore = require("connect-mongodb-session")(session);
import pgk from "connect-mongodb-session";
const MongoDBStore = pgk(session);

import ErrorResponse from "../utils/errorResponse.js";

import { config } from "dotenv";
config({ path: "./config/config.env" });

const expiryTime = 24 * 60 * 60 * 1000; // 1 day

var store = new MongoDBStore({
    uri: "mongodb://localhost:27017/WebAuth-DB",
    collection: "mySessions",
    expiresAfterSeconds: expiryTime,
});

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: expiryTime, httpOnly: true, signed: true },
    saveUninitialized: true,
    resave: false,
    store: store,
};

const session_middleware = session(sessionOptions);

const checkSession = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        next(
            new ErrorResponse(
                "You are not authorized to view this resource",
                401
            )
        );
    }
};

const deleteSession = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            next(new ErrorResponse("Could not delete session", 500));
        } else {
            next();
        }
    });
};

export { session_middleware, checkSession, deleteSession };
