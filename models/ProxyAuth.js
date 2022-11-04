import { Entity, Schema, Client, Repository } from 'redis-om';

let client = new Client();
await client.open('redis://localhost:6379');

class ProxyAuth extends Entity {}
const ProxyAuthSchema = new Schema(ProxyAuth, {
	user_id: { type: 'string' },
	proxy_type: { type: 'string' },
	valid: { type: 'boolean' },
	used: { type: 'boolean' },
});

let proxyAuthRepository = client.fetchRepository(ProxyAuthSchema);

await proxyAuthRepository.dropIndex();
await proxyAuthRepository.createIndex();

export default proxyAuthRepository;
