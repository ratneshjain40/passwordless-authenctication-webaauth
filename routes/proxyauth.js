import { Router } from 'express';
const router = Router();
import { session_middleware, checkSession } from '../middlewares/sessions.js';
import { checkPermissionLevel } from '../middlewares/permissions.js';

// Import controllers
import {
	registerRequest,
	registerResponse,
	signInRequest,
	signInResponse,
} from '../controllers/webauthn.js';
import { proxyIdUse, proxyIdCheck } from '../middlewares/proxyauth.js';
import { proxyAuthCreate, proxyAuthCheck } from '../controllers/proxyauth.js';

// ------- Endpoints Without Permission Check -------------

router.post('/create', proxyAuthCreate);
router.use(session_middleware);

// ------- Endpoints Without Permission Check -------------

router.post('/signInRequest', proxyIdCheck, signInRequest);
router.post('/signInResponse', proxyIdCheck, signInResponse, proxyIdUse);

router.use(checkPermissionLevel('GUEST'));

// ---------------- ROUTES ----------------

router.post('/registerRequest', checkSession, proxyIdCheck, registerRequest);
router.post(
	'/registerResponse',
	checkSession,
	proxyIdCheck,
	registerResponse,
	proxyIdUse
);

export default router;
