const ErrorResponse = require("../utils/errorResponse");

const checkSession = (req, res, next) => {
    if (req.session.isLoggedIn) {
        next();
    } else {
        next(
            new ErrorResponse('You are not authorized to view this resource', 401)
        );
    }
}

const deleteSession = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            next(
                new ErrorResponse('Could not delete session', 500)
            );
        } else {
            next();
        }
    }
    );
}

module.exports = { checkSession, deleteSession };