import jsonwebtoken from "jsonwebtoken";
const { sign, verify } = jsonwebtoken;

import { config } from "dotenv";
config({ path: "./config/config.env" });

const key = process.env.TOKEN_KEY;

export function issueJWT(data) {
    // The time the token is valid for
    const expiresIn = "1d";

    const payload = {
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

export function verifyJWT(token) {
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