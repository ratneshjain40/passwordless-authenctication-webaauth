// Can throw a custom error with next(new ErrorResponse(message, statusCode))
const ErrorResponse = require('../utils/errorResponse');

errorHandler = (err, req, res, next) => {
	// log error
	console.log(err);

	// Copy of error
	let error = err;

	// Mongoose bad ObjectID
	if (err.name === 'CastError') {
		const message = `No Resource found with the id of ${err.value}`;
		error = new ErrorResponse(message, 404);
	}

	// Mongoose Duplicate Key
	if (err.code === 11000) {
		const message = `Email or username already exists`;
		error = new ErrorResponse(message, 400);
	}

	// Mongoose Validation Error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}

	// sending new error and errorStatus
	res.status(error.statusCode || 500).json({
		success: false,
		message: error.message || 'Server Error',
	});
};

module.exports = errorHandler;
