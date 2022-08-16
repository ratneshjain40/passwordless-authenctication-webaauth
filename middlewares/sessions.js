const session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);

var store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'mySessions'
});

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 20000, httpOnly: true, signed: true },
    saveUninitialized: true,
    resave: false,
    store: store,
}

module.exports = session(sessionOptions);