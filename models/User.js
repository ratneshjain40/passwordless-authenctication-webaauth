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
	authenticators: [{
		credentialID: String,
		credentialPublicKey: String,
		counter: Number,
	}]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
