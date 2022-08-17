const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} = require('@simplewebauthn/server');

const User = require('../models/user');

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
            res.status(200).json({
                success: true,
                message: 'Registration successful',
            });
        } else {
            throw new ErrorResponse('Registration failed', 500);
        }

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
    } catch (error) {
        next(error);
    }
}


