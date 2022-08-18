const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Please enter username'],
		unique: [true, 'Username already exists'],
	},
	hash: {
		type: String,
		required: true,
	},
	salt: {
		type: String,
		required: true,
	},
});

const userAuthSchema = new mongoose.Schema({
	userID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	authenticators: [{
		credentialID: String,
		credentialPublicKey: String,
		counter: Number,
	}],
	authCode: {
		code: String,
		expires: Date,
		valid: Boolean,
	}
});

const User = mongoose.model('User', userSchema);
const UserAuth = mongoose.model('UserAuth', userAuthSchema);

module.exports = { User, UserAuth };
