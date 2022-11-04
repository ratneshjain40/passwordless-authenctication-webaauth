import proxyAuthRepository from '../models/ProxyAuth.js';

// check request params for proxy_id
export async function proxyIdCheck(req, res, next) {
	try {
		let id = req.query.id;

		if (!id) {
			throw new ErrorResponse('Missing id', 400);
		}

		let entity = await proxyAuthRepository.fetch(id);
		if (!entity) {
			throw new ErrorResponse('Could not find entity', 404);
		}
		if (entity.used === true && entity.valid === true) {
			throw new ErrorResponse('Entity already used', 400);
		} else {
			next();
		}
	} catch (error) {
		next(error);
	}
}

export async function proxyIdUse(req, res, next) {
	try {
		let id = req.query.id;

		let entity = await proxyAuthRepository.fetch(id);

		entity.used = true;
		await proxyAuthRepository.save(entity);

		res.status(200).json({
			success: true,
		});
	} catch (error) {
		next(error);
	}
}
