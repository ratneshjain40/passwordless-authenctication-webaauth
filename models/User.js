const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter username"],
        unique: [true, "Username already exists"],
    },
    hash: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    authenticators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Authenticator",
        },
    ],
});

const authenticatorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    credentialID: String,
    credentialPublicKey: String,
    counter: Number,
    transports: [String],
});

const User = mongoose.model("User", userSchema);
const Authenticator = mongoose.model("Authenticator", authenticatorSchema);

module.exports = { User, Authenticator };
