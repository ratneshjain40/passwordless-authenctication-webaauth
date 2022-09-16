export const PERMISSIONS = {
    ADMIN: 0,
    USER: 1,
    GUEST: 2,
};

export const checkPermissionLevel = (type) => {
    if (PERMISSIONS[type] === undefined) {
        throw new ErrorResponse("Invalid permission level", 401);
    }
    return (req, res, next) => {
        try {
            if (req.session.user.permission <= PERMISSIONS[type]) {
                next();
            } else {
                throw new ErrorResponse(
                    "You are not authorized to view this resource",
                    401
                );
            }
        } catch (error) {
            next(error);
        }
    };
};
