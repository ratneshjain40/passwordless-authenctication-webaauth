const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const base64url = require("base64url");

const ErrorResponse = require("../utils/errorResponse");

const { User, Authenticator } = require("../models/user");
const { randomToken } = require("../utils/passwords");

const rpName = "SimpleWebAuthn Example";
const rpID = "localhost";
const origin = `http://${rpID}:3000`;

exports.registerRequest = async (req, res, next) => {
    try {
        // Telling the browser what type of authenticator we want to use and sending the challenge
        const user = req.session.user;
        const userAuthenticators = await Authenticator.find({ user: user._id });

        const options = generateRegistrationOptions({
            rpName,
            rpID,
            userID: user._id,
            userName: user.username,
            // Prevent users from re-registering existing authenticators
            excludeCredentials: userAuthenticators.map((authenticator) => ({
                id: authenticator.credentialID,
                type: "public-key",
            })),
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
            },
        });

        options.pubKeyCredParams = [];
        const params = [-7, -257];
        for (let param of params) {
            options.pubKeyCredParams.push({ type: "public-key", alg: param });
        }

        req.session.userChallenge = options.challenge;

        res.status(200).json({
            success: true,
            options,
        });
    } catch (error) {
        next(error);
    }
};

exports.registerResponse = async (req, res, next) => {
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
            const { credentialPublicKey, credentialID, counter } =
                registrationInfo;

            const authenticator = await Authenticator.create({
                user: req.session.user._id,
                credentialID: base64url.encode(credentialID),
                credentialPublicKey: base64url.encode(credentialPublicKey),
                counter,
                transports: ["internal"],
            });

            if (!authenticator) {
                throw new ErrorResponse("Could not add authenticators", 404);
            }

            delete req.session.challenge;

            res.status(200).json({
                success: true,
                message: "Registration successful",
            });
        } else {
            throw new ErrorResponse("Registration failed", 500);
        }
    } catch (error) {
        next(error);
    }
};

exports.signInRequest = async (req, res, next) => {
    // Giving the browser the challenge and the options to sign in with authenticator previously registered
    try {
        const user = await User.findById(req.session.user._id);
        // console.log(user);
        const userAuthenticators = await Authenticator.find({ user: user._id });

        const options = generateAuthenticationOptions({
            // Require users to use a previously-registered authenticator
            rpName,
            rpID,
            allowCredentials: userAuthenticators.map((authenticator) => ({
                id: base64url.toBuffer(authenticator.credentialID),
                type: "public-key",
                transports: authenticator.transports,
            })),
            userVerification: "required",
        });

        req.session.userChallenge = options.challenge;

        res.status(200).json({
            success: true,
            options,
        });
    } catch (error) {
        next(error);
    }
};

exports.signInResponse = async (req, res, next) => {
    // cross checking the produced credentials with the ones in the database
    try {
        const { body } = req;
        const expectedChallenge = req.session.userChallenge;
        const user = await User.findById(req.session.user._id);

        let authenticator = await Authenticator.findOne({
            user: user._id,
            credentialID: body.id,
        });

        if (!authenticator) {
            throw new ErrorResponse("Authenticator not found", 404);
        }
        const authenticatorObject = {
            credentialID: base64url.toBuffer(authenticator.credentialID),
            credentialPublicKey: base64url.toBuffer(
                authenticator.credentialPublicKey
            ),
            counter: authenticator.counter,
        };

        if (!authenticator) {
            throw new ErrorResponse(
                `Could not find authenticator ${body.id} for user ${user._id}`,
                500
            );
        }

        let verification = verifyAuthenticationResponse({
            credential: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: authenticatorObject,
        });

        const { authenticationInfo } = verification;
        const { newCounter } = authenticationInfo;

        const updateCounter = await Authenticator.findOneAndUpdate(
            { credentialID: body.id },
            { counter: newCounter }
        );

        if (!updateCounter) {
            throw new ErrorResponse(
                `Could not update counter for user ${user.id}`,
                500
            );
        }

        if (verification.verified) {
            res.status(200).json({
                success: true,
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Authentication failed",
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.getRemoteToken = async (req, res, next) => {
    try {
        const token = randomToken(32);
        req.session.remoteToken = {
            token: token,
            time: Date.now(),
            used: false,
        };
        const valid = await req.session.save();
        if (!valid) {
            throw new ErrorResponse("Could not save session", 500);
        }
        res.status(200).json({
            success: true,
            token,
        });
    } catch (error) {
        next(error);
    }
};
