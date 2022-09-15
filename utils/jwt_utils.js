import { sign, verify } from "jsonwebtoken";

import { config } from "dotenv";
config({ path: "./config/config.env" });

const key = process.env.TOKEN_KEY;

function issueJWT(data) {
    const _id = data._id;

    // The time the token is valid for
    const expiresIn = "1d";

    const payload = {
        sub: _id,
        data: data,
        iat: Date.now(),
    };

    const signedToken = sign(payload, key, {
        expiresIn: expiresIn,
    });

    return {
        token: signedToken,
        expires: expiresIn,
    };
}

function verifyJWT(token) {
    var payload;
    try {
        payload = verify(token, key);
        return {
            success: true,
            payload: payload,
        };
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return {
                success: false,
                status: 401,
                message: "unauthorized",
            };
        }
        return {
            success: false,
            status: 400,
            message: "bad request",
        };
    }
}