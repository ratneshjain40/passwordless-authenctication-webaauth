const session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);

const expiryTime = 24 * 60 * 60 * 1000; // 1 day

var store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/WebAuth-DB',
    collection: 'mySessions',
    expiresAfterSeconds: expiryTime,
});

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: expiryTime, httpOnly: true, signed: true },
    saveUninitialized: true,
    resave: false,
    store: store,
}

const session_middleware = session(sessionOptions);

module.exports = session_middleware;