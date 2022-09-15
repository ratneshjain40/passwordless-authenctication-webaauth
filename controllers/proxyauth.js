import { randomUUID } from "../utils/passwords.js";
import proxyAuthRepository from "../models/ProxyAuth.js";
import ErrorResponse from "../utils/errorResponse.js";
import client from "../db/redis.js";

const EXPIRE_TIME = 60 * 3; // 3 minutes

export async function createProxy(req, res, next) {
    try {
        const uuid = randomUUID();
        const user_id = req.session.user._id;

        const exists = await proxyAuthRepository
            .search()
            .where("user_id")
            .eq(user_id)
            .return.all();
        if (exists.length > 0) {
            throw new ErrorResponse("User already has a proxy", 400);
        }

        const entry = await proxyAuthRepository.createAndSave({
            proxy_id: uuid,
            user_id: user_id,
            valid: true,
            used: false,
        });

        await client.execute(["EXPIRE", `ProxyAuth:${entry.entityId}`, EXPIRE_TIME]);

        if (!entry) {
            throw new ErrorResponse("Could not create proxy auth", 500);
        }

        res.status(200).json({
            success: true,
            message: "ProxyAuth created",
            data: entry,
        });
    } catch (error) {
        next(error);
    }
}
