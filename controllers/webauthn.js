const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} = require('@simplewebauthn/server');

const { User, UserAuth } = require('../models/user');

const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';
const origin = `https://${rpID}`;

exports.registerRequest = async (req, res, next) => {
    try {
        const user = req.session.user;
        const _userauth = await UserAuth.find({ userID: user.id });
        const userAuthenticators = _userauth.authenticators;

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

            const user = await UserAuth.findByIdAndUpdate(req.session.user.id, { $push: { authenticators: newAuthenticator } });
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
        const _userauth = await UserAuth.find({ userID: user.id });
        const userAuthenticators = _userauth.authenticators;

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
        const authenticator = await UserAuth.find({ 'authenticators.credentialID': body.id });

        if (!authenticator) {
            throw new Error(`Could not find authenticator ${body.id} for user ${user.id}`);
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
            const counter = await UserAuth.findByIdAndUpdate(user.id, { 'authenticators.$.counter': newCounter });
            if (!counter) {
                throw new Error(`Could not update counter for user ${user.id}`);
            }
        } else {
            res.status(500).json({ success: false, message: 'Authentication failed' });
        }

    } catch (error) {
        next(error);
    }
}