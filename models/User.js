import mongoose from "mongoose";
const { Schema, model } = mongoose;


const userSchema = new Schema({
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
            type: mongoose.ObjectId,
            ref: "Authenticator",
        },
    ],
});

const authenticatorSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    credentialID: String,
    credentialPublicKey: String,
    counter: Number,
    transports: [String],
});

const User = model("User", userSchema);
const Authenticator = model("Authenticator", authenticatorSchema);

export { User, Authenticator };