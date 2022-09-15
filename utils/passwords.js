import { pbkdf2Sync, randomBytes } from 'crypto';

function validPassword(password, hash, salt) {
    var hashVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

function genPassword(password) {
    var salt = randomBytes(32).toString('hex');
    var genHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: genHash
    };
}

function randomUUID(size = 21) {
    return randomBytes(size).toString('base64').replace(/\//g, '_').replace(/\+/g, '-').slice(0, size).toString('base64');
}

export { genPassword, validPassword, randomUUID };