const {
    customAlphabet, 
    nanoid
} = require("nanoid");

const ms = require("ms");

const moment = require("moment");

const VERIFICATION_CODE_DIGITS = 6;
const ACTIVATION_CODE_DIGITS = 6;
const VERIFICATION_TOKEN_CHARS = 43;
const EMAIL_VERIFICATION_CODE_EXPIRE = process.env.EMAIL_VERIFICATION_CODE_EXPIRE;
const RESET_PASSWORD_VERIFICATION_CODE_EXPIRE = process.env.RESET_PASSWORD_VERIFICATION_CODE_EXPIRE;
const RESET_PASSWORD_VERIFICATION_TOKEN_EXPIRE = process.env.RESET_PASSWORD_VERIFICATION_TOKEN_EXPIRE;

async function getNanoid() {
    return nanoid();
}

async function getVerificationCode() {
    const codeGen = customAlphabet("0123456789", VERIFICATION_CODE_DIGITS);
    const code = await codeGen();
    return code;
}

async function getActivationCode() {
    const codeGen = customAlphabet("0123456789", ACTIVATION_CODE_DIGITS);
    const code = await codeGen();
    return code;
}

//generates a TOKEN for the reset password and verify email apis
async function getVerificationToken() {
    return nanoid(VERIFICATION_TOKEN_CHARS);
}

//All time is stored in ISO 8601
// expiry time of email verification to activate account = current time + set time
function getActivationCodeExpiry() {
    const expiryTime = moment().add(ms(EMAIL_VERIFICATION_CODE_EXPIRE), 'ms').toISOString();
    return expiryTime;
}

// expiry time of email password reset = current time + set time
function getResetPasswordCodeExpiryTime() {
    const expiryTime = moment().add(ms(RESET_PASSWORD_VERIFICATION_CODE_EXPIRE), 'ms').toISOString();
    return expiryTime;
}

// expiry time of email password reset token = current time + set time
function getResetPasswordTokenExpiryTime() {
    const expiryTime = moment().add(ms(RESET_PASSWORD_VERIFICATION_TOKEN_EXPIRE), 'ms').toISOString();
    return expiryTime;
}

module.exports = {
    getNanoid,
    getVerificationCode,
    getActivationCode,
    getVerificationToken,
    getActivationCodeExpiry,
    getResetPasswordCodeExpiryTime,
    getResetPasswordTokenExpiryTime
}