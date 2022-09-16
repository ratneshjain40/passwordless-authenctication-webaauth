import { Router } from "express";
const router = Router();
import { session_middleware, checkSession } from "../middlewares/sessions.js";

// Import controllers

router.use(session_middleware);

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

export default router;
