import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from '@simplewebauthn/server';

import base64url from 'base64url';
const { encode, toBuffer } = base64url;

import ErrorResponse from '../utils/errorResponse.js';

import { User, Authenticator } from '../models/user.js';

const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';
const origin = `http://${rpID}:3000`;

export async function registerRequest(req, res, next) {
	try {
		// Telling the browser what type of authenticator we want to use and sending the challenge
		const user = await User.findById(req.session.user._id);
		const userAuthenticators = await Authenticator.find({ user: user._id });

		const options = generateRegistrationOptions({
			rpName,
			rpID,
			userID: user._id,
			userName: user.username,
			// Prevent users from re-registering existing authenticators
			excludeCredentials: userAuthenticators.map((authenticator) => ({
				id: authenticator.credentialID,
				type: 'public-key',
			})),
			authenticatorSelection: {
				authenticatorAttachment: 'platform',
				userVerification: 'required',
			},
		});

		options.pubKeyCredParams = [];
		const params = [-7, -257];
		for (let param of params) {
			options.pubKeyCredParams.push({ type: 'public-key', alg: param });
		}

		req.session.userChallenge = options.challenge;

		res.status(200).json({
			success: true,
			options,
		});
	} catch (error) {
		next(error);
	}
}

export async function registerResponse(req, res, next) {
	// verifing the challenge and origin from the browser,
	// if they match, then we can register the authenticator with the given credential
	try {
		const { body } = req;
		const expectedChallenge = req.session.userChallenge;
		let verification = await verifyRegistrationResponse({
			credential: body,
			expectedChallenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
		});

		if (verification.verified) {
			const { registrationInfo } = verification;
			const { credentialPublicKey, credentialID, counter } = registrationInfo;

			// add authenticator if permission is user, add to redis if permission is guest

			const authenticator = await Authenticator.create({
				user: req.session.user._id,
				credentialID: encode(credentialID),
				credentialPublicKey: encode(credentialPublicKey),
				counter,
				transports: ['internal'],
			});

			if (!authenticator) {
				throw new ErrorResponse('Could not add authenticators', 404);
			}

			delete req.session.challenge;

			if (req.params.id) {
				next();
			} else {
				res.status(200).json({
					success: true,
					message: 'Registration successful',
				});
			}
		} else {
			throw new ErrorResponse('Registration failed', 500);
		}
	} catch (error) {
		next(error);
	}
}

export async function signInRequest(req, res, next) {
	// Giving the browser the challenge and the options to sign in with authenticator previously registered
	try {
		// Sign In with user_name insted of session_id
		console.log(req.body.username);
		const user = await User.findOne({ username: req.body.username });
		console.log(user);
		const userAuthenticators = await Authenticator.find({ user: user._id });
		const options = generateAuthenticationOptions({
			// Require users to use a previously-registered authenticator
			rpName,
			rpID,
			allowCredentials: userAuthenticators.map((authenticator) => ({
				id: toBuffer(authenticator.credentialID),
				type: 'public-key',
				transports: authenticator.transports,
			})),
			userVerification: 'required',
		});

		req.session.userChallenge = options.challenge;

		res.status(200).json({
			success: true,
			options,
		});
	} catch (error) {
		next(error);
	}
}

export async function signInResponse(req, res, next) {
	// cross checking the produced credentials with the ones in the database
	try {
		const { attestation, username } = req.body;
		const expectedChallenge = req.session.userChallenge;
		const user = await User.findOne({ username: username });

		let authenticator = await Authenticator.findOne({
			user: user._id,
			credentialID: attestation.id,
		});

		if (!authenticator) {
			throw new ErrorResponse('Authenticator not found', 404);
		}
		const authenticatorObject = {
			credentialID: toBuffer(authenticator.credentialID),
			credentialPublicKey: toBuffer(authenticator.credentialPublicKey),
			counter: authenticator.counter,
		};

		if (!authenticator) {
			throw new ErrorResponse(
				`Could not find authenticator ${attestation.id} for user ${user._id}`,
				500
			);
		}

		let verification = verifyAuthenticationResponse({
			credential: attestation,
			expectedChallenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
			authenticator: authenticatorObject,
		});

		const { authenticationInfo } = verification;
		const { newCounter } = authenticationInfo;

		const updateCounter = await Authenticator.findOneAndUpdate(
			{ credentialID: attestation.id },
			{ counter: newCounter }
		);

		if (!updateCounter) {
			throw new ErrorResponse(
				`Could not update counter for user ${user.id}`,
				500
			);
		}

		if (verification.verified) {
			if (req.params.id) {
				next();
			} else {
				res.status(200).json({
					success: true,
				});
			}
		} else {
			res.status(500).json({
				success: false,
				message: 'Authentication failed',
			});
		}
	} catch (error) {
		next(error);
	}
}
