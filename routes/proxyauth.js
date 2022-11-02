import { Router } from "express";
const router = Router();
import { session_middleware, checkSession } from "../middlewares/sessions.js";
import { checkPermissionLevel } from "../middlewares/permissions.js";

// Import controllers
import {
    registerRequest,
    registerResponse,
    signInRequest,
    signInResponse,
} from "../controllers/webauthn.js";
import { proxyIdUse, proxyIdCheck } from "../middlewares/proxyauth.js";
import { proxyAuthCreate, proxyAuthCheck } from "../controllers/proxyauth.js";

router.use(session_middleware);
router.use(checkPermissionLevel("GUEST"));

// ---------------- DEBBUGING ----------------

// function custom_middle(req, res, next) {
// 	console.log("USER OBJECT ");
// 	console.log(req.session.user);

// 	console.log("SESSION OBJECT ");
// 	console.log(JSON.stringify(req.session));
// 	next();
// }
// router.use(custom_middle);

// ---------------- ROUTES ----------------

router.post("/registerRequest", checkSession, proxyIdCheck, registerRequest);
router.post("/registerResponse", checkSession, proxyIdCheck, registerResponse, proxyIdUse);
router.post("/signInRequest", proxyIdCheck, signInRequest);
router.post("/signInResponse", proxyIdCheck, signInResponse, proxyIdUse);
router.post("/create", proxyAuthCreate);

export default router;
