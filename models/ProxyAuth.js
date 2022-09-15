import { Entity, Schema } from "redis-om";
import client from "../db/redis.js";

class ProxyAuth extends Entity {}
const ProxyAuthSchema = new Schema(ProxyAuth, {
    proxy_id: { type: "string" },
    user_id: { type: "string" },
    valid: { type: "boolean" },
    used: { type: "boolean" },
});

const proxyAuthRepository = client.fetchRepository(ProxyAuthSchema);

await proxyAuthRepository.dropIndex();
await proxyAuthRepository.createIndex();

export default proxyAuthRepository;
