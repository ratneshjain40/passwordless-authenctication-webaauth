import ErrorResponse from "../utils/errorResponse.js";
import proxyAuthRepository from "../models/ProxyAuth.js";

export async function proxyAuthCreate(req, res, next) {
    try {
        let entity, id;

        if (
            !(
                req.body.proxy_type == "register" ||
                req.body.proxy_type == "signin"
            )
        ) {
            throw new ErrorResponse("Invalid proxy type", 400);
        }

        entity = proxyAuthRepository.createEntity();

        entity.user_id = req.session.user._id;
        entity.proxy_type = req.body.proxy_type;
        entity.valid = true;
        entity.used = false;

        id = await proxyAuthRepository.save(entity);

        res.status(200).json({
            success: true,
            id,
        });
    } catch (error) {
        next(error);
    }
}

export async function proxyAuthCheck(req, res, next) {
    try {
        let id = req.body.id;

        if (!id) {
            throw new ErrorResponse("Missing id", 400);
        }

        let entity = await proxyAuthRepository.fetch(id);
        if (!entity) {
            throw new ErrorResponse("Could not find entity", 404);
        }
        if (entity.used === true && entity.valid === true) {
            res.status(200).json({
                success: true,
                id,
            });
        } else {
            res.status(200).json({
                success: false,
                id,
            });
        }
    } catch (error) {
        next(error);
    }
}
