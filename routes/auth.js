const express = require('express');
const router = express.Router();
const sessions = require('../middlewares/sessions');	

// Import controllers
const {
	registerUser, loginUser, isLoggedIn, logoutUser,
} = require('../controllers/auth'); 

router.use(sessions);

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

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/islogged', isLoggedIn);

module.exports = router;
