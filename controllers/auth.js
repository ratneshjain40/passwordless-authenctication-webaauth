import { genPassword, validPassword } from "../utils/passwords.js";
import { User } from "../models/user.js";
import ErrorResponse from "../utils/errorResponse.js";

export async function registerUser(req, res, next) {
    try {
        const { username, password } = req.body;
        const { hash, salt } = genPassword(password);

        const user = await User.create({
            username: username,
            hash: hash,
            salt: salt,
        });
        if (!user) {
            throw new ErrorResponse("Could not create franchise", 500);
        }

        res.status(200).json({
            success: true,
            message: "User Registered",
            user,
        });
    } catch (error) {
        next(error);
    }
}

export async function loginUser(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        if (!user) {
            throw new ErrorResponse("User not found", 404);
        }
        const isValid = validPassword(password, user.hash, user.salt);
        if (!isValid) {
            throw new ErrorResponse("Invalid password", 401);
        }

        const session_user_data = {
                _id: user._id.toString(),
        };

        req.session.user = session_user_data;
        req.session.isLoggedIn = true;

        res.status(200).json({
            success: true,
            message: "User logged in",
        });
    } catch (error) {
        next(error);
    }
}

export async function logoutUser(req, res, next) {
    try {
        req.session.destroy((err) => {
            if (err) {
                throw new ErrorResponse("Could not delete session", 500);
            } else {
                res.status(200).json({
                    success: true,
                    message: "User logged out",
                });
            }
        });
    } catch (error) {
        next(error);
    }
}

// Private route
export async function isLoggedIn(req, res, next) {
    try {
        if (req.session.isLoggedIn) {
            res.json({
                success: true,
                message: "User logged in",
                user: req.session.user,
            });
        } else {
            throw new ErrorResponse(
                "You are not authorized to view this resource",
                401
            );
        }
    } catch (error) {
        next(error);
    }
}
