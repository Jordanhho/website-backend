const jwt = require("jsonwebtoken");
const moment = require("moment");
const { nanoid } = require("nanoid");
const ms = require("ms");

const dev = process.env.NODE_ENV !== "production";

// active refresh token list stored on server to manage the xsrf token
const activeRefreshTokenList = {};

// cookie options to create refresh token
const COOKIE_OPTIONS = {
    // domain: "localhost",
    httpOnly: true, //both httponly and secure true makes it so the cookie cannt be read by client side javascript or over any non ssl connection
    secure: !dev,
    signed: true
};


// generate a token from combining xsrf and jwt and return it
function generateAccessToken(cleanUserObj) {
    return new Promise(resolve => {
        //clean user object does not have any sensitive user information
        if (!cleanUserObj) {
            resolve(null);
        }

        //use specifically userid, email, firstname, lastname in generation
        const userData = {
            userid: cleanUserObj.userid,
            firstname: cleanUserObj.firstname,
            lastname: cleanUserObj.lastname,
            email: cleanUserObj.email,
        };

        //generate xsrf token of 32 length to generate the access token
        const xsrfToken = nanoid(32);

        // create private key by combining JWT secret and xsrf token
        const privateKey = process.env.JWT_SECRET + xsrfToken;

        // generate access token and expiry date
        const refreshToken = jwt.sign(
            userData,
            privateKey, 
            { expiresIn: process.env.ACCESS_TOKEN_LIFE }
        );

        // expiry time of the access token
        const expiredAt = moment().add(ms(process.env.ACCESS_TOKEN_LIFE), 'ms').valueOf();

        resolve({
            refreshToken,
            expiredAt,
            xsrfToken
        });
    });
}

// generate refresh token from userid and jwt
function generateRefreshToken(userid) {
    return new Promise(resolve => {
        if (!userid) {
            resolve(null);
        }
        resolve(jwt.sign(
            { userid },
            process.env.JWT_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_LIFE }
        ));
    });
}

// verify access token and refresh token
function verifyToken(refreshToken, xsrfToken = "", callBack) {
    const privateKey = process.env.JWT_SECRET + xsrfToken;
    jwt.verify(refreshToken, privateKey, callBack);
}

// handle the API response
function handleResponse(req, res, statusCode, data, message) {
    let isError = false;
    let errorMessage = message;

    switch (statusCode) {
        case 204:
            return res.sendStatus(204);
        case 400:
            isError = true;
            break;
        case 401:
            isError = true;
            errorMessage = message || 'Invalid user.';
            clearTokens(req, res);
            break;
        case 403:
            isError = true;
            errorMessage = message || 'Access to this resource is denied.';
            clearTokens(req, res);
            break;
        case 409:
            isError = true;
            errorMessage = message || 'Conflicting Data';
            clearTokens(req, res);
            break;
        default:
            break;
    }

    const resObj = data || {};

    console.log("sending ", resObj);

    if (isError) {
        resObj.error = true;
        resObj.message = errorMessage;
    }

    return res.status(statusCode).json(resObj);
}

// clear token access, refresh and csrf tokens from cookie
function clearTokens(req, res) {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    delete activeRefreshTokenList[refreshToken];

    res.clearCookie('XSRF-TOKEN');
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
}

module.exports = {
    activeRefreshTokenList,
    COOKIE_OPTIONS,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    handleResponse,
    clearTokens
}