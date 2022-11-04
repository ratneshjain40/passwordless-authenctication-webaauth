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

// ------- Exposed Endpoints -------------
router.post('/create', proxyAuthCreate);

// ---------------- ROUTES ----------------

// router.use(checkPermissionLevel('GUEST'));
router.use(session_middleware);

router.post('/registerRequest', proxyIdCheck, registerRequest);
router.post(
	'/registerResponse',

	proxyIdCheck,
	registerResponse,
	proxyIdUse
);
router.post('/signInRequest', proxyIdCheck, signInRequest);
router.post('/signInResponse', proxyIdCheck, signInResponse, proxyIdUse);

export default router;
