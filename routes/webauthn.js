import { Router } from "express";
const router = Router();
import { session_middleware, checkSession } from "../middlewares/sessions.js";
import { checkPermissionLevel } from "../middlewares/permissions.js";

// Import controllers
import { registerRequest, registerResponse, signInRequest, signInResponse } from "../controllers/webauthn.js";

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

router.post("/registerRequest", checkSession, registerRequest);
router.post("/registerResponse", checkSession, registerResponse);
router.post("/signInRequest", checkSession, signInRequest);
router.post("/signInResponse", checkSession, signInResponse);

export default router;
