import { Router } from "express";
const router = Router();
import { session_middleware } from "../middlewares/sessions.js";

// Import controllers
import { registerUser, loginUser, isLoggedIn, logoutUser } from "../controllers/auth.js";

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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/islogged", isLoggedIn);

export default router;
