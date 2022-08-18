const passwords = require('../utils/passwords');
const { User } = require('../models/user');
const ErrorResponse = require('../utils/errorResponse');

exports.registerUser = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const { hash, salt } = passwords.genPassword(password);

		const user = await User.create({ username: username, hash: hash, salt: salt });
		if (!user) {
			throw new ErrorResponse('Could not create franchise', 500);
		}

		res.status(200).json({
			success: true,
			message: 'User Registered',
			user,
		});

	} catch (error) {
		next(error);
	}
};

exports.loginUser = async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username: username });
		if (!user) {
			throw new ErrorResponse('User not found', 404);
		}
		const isValid = passwords.validPassword(password, user.hash, user.salt);
		if (!isValid) {
			throw new ErrorResponse('Invalid password', 401);
		}

		req.session.user = user;
		req.session.isLoggedIn = true;

		res.status(200).json({
			success: true,
			message: 'User logged in',
			user,
		});

	} catch (error) {
		next(error);
	}
}

exports.logoutUser = async (req, res, next) => {
	try {
		req.session.destroy(err => {
			if (err) {
				throw new ErrorResponse('Could not delete session', 500)
			} else {
				res.status(200).json({
					success: true,
					message: 'User logged out',
				});
			}
		}
		);
	} catch (error) {
		next(error);
	}
}

// Private route
exports.isLoggedIn = async (req, res, next) => {
	try {
		if (req.session.isLoggedIn) {
			res.json({
				success: true,
				message: 'User logged in',
				user: req.session.user,
			});
		} else {
			throw new ErrorResponse('You are not authorized to view this resource', 401);
		}
	} catch (error) {
		next(error);
	}
}