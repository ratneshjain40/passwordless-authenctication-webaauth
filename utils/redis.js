import client from "../db/redis";

export const setRedisKey = async (key, value, expire) => {
    try {
        await client.set(key, value);
        await client.expire(key, expire);
    } catch (error) {
        throw new ErrorResponse(error.message, 500);
    }
};

export const getRedisKey = async (key) => {
    try {
        const value = await client.get(key);
        return value;
    } catch (error) {
        throw new ErrorResponse(error.message, 500);
    }
}

export const deleteRedisKey = async (key) => {
    try {
        await client.del(key);
    } catch (error) {
        throw new ErrorResponse(error.message, 500);
    }
}