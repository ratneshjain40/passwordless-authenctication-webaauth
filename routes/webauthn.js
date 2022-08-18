const express = require('express');
const router = express.Router();
const sessions = require('../middlewares/sessions');

// Import controllers
const { registerRequest, registerResponse, signInRequest, signInResponse } = require('../controllers/webauthn');
const { checkSession } = require('../auth/sessions');


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

router.post('/registerRequest', checkSession , registerRequest);
router.post('/registerResponse', checkSession , registerResponse);
router.post('/signInRequest', checkSession , signInRequest);
router.post('/signInResponse', checkSession , signInResponse);

module.exports = router;
