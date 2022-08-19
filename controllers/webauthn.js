const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} = require('@simplewebauthn/server');

const { User } = require('../models/user');
const { randomToken } = require('../utils/passwords');

const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';
const origin = `https://${rpID}`;

exports.registerRequest = async (req, res, next) => {
    try {
        const user = req.session.user;
        const userAuthenticators = user.authenticators;

        const options = generateRegistrationOptions({
            rpName,
            rpID,
            userID: user.id,
            userName: user.username,
            // Prevent users from re-registering existing authenticators
            excludeCredentials: userAuthenticators.map(authenticator => ({
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

exports.registerResponse = async (req, res, next) => {
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

            const newAuthenticator = {
                credentialID,
                credentialPublicKey,
                counter,
            };

            const user = await User.findByIdAndUpdate(req.session.user.id, { $push: { authenticators: newAuthenticator } });
            if (!user) {
                throw new ErrorResponse('Could not add user', 404);
            }

            delete req.session.challenge;

            res.status(200).json({
                success: true,
                message: 'Registration successful',
            });
        } else {
            throw new ErrorResponse('Registration failed', 500);
        }

    } catch (error) {
        next(error);
    }
}

exports.signInRequest = async (req, res, next) => {
    try {
        const user = req.session.user;
        const userAuthenticators = user.authenticators;

        const options = generateAuthenticationOptions({
            // Require users to use a previously-registered authenticator
            allowCredentials: userAuthenticators.map(authenticator => ({
                id: authenticator.credentialID,
                type: 'public-key',
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

exports.signInResponse = async (req, res, next) => {
    try {
        const { body } = req;
        const user = req.session.user;
        const expectedChallenge = req.session.userChallenge;
        // can check authenticator against user.authenticators to prevent extra db query
        const authenticator = await User.find({ 'authenticators.credentialID': body.id });

        if (!authenticator) {
            throw new ErrorResponse(`Could not find authenticator ${body.id} for user ${user.id}`, 500);
        }

        let verification = await verifyAuthenticationResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator,
        });

        if (verification.verified) {
            res.status(200).json({
                success: true,
                options,
            });
            const { authenticationInfo } = verification;
            const { newCounter } = authenticationInfo;
            const counter = await User.findByIdAndUpdate(user.id, { 'authenticators.$.counter': newCounter });
            if (!counter) {
                throw new ErrorResponse(`Could not update counter for user ${user.id}`, 500);
            }
        } else {
            res.status(500).json({ success: false, message: 'Authentication failed' });
        }

    } catch (error) {
        next(error);
    }
}

exports.getRemoteToken = async (req, res, next) => {
    try {
        const token = randomToken(32);
        req.session.remoteToken = { token: token, time: Date.now(), used: false };
        const valid = await req.session.save();
        if (!valid) {
            throw new ErrorResponse('Could not save session', 500);
        }
        res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        next(error);
    }
}