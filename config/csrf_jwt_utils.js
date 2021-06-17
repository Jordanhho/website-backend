const jwt = require("jsonwebtoken");
const moment = require("moment");
const { nanoid } = require("nanoid");
const ms = require("ms");

const dev = process.env.NODE_ENV !== "production";

// active refresh token list stored on server to manage the csrf token
//active session list where each key is the refresh token, the value is a object with the fields email and csrf token
const activeRefreshTokenList = {};

const CSRF_TOKEN_LENGTH = 32;

// cookie options to create refresh token
const COOKIE_OPTIONS = {
    // domain: "localhost",
    httpOnly: true, //both httponly and secure true makes it so the cookie cannt be read by client side javascript or over any non ssl connection
    secure: !dev,
    signed: true
};

//generates token Obj
async function genAccessTokenObj(userDbObj) {
 
    //clean user object does not have any sensitive user information
    if (!userDbObj) {
        resolve(null);
    }

    //use specifically userid, email, firstname, lastname in generation
    const cleanUserData = {
        userid: userDbObj.userid,
        firstname: userDbObj.firstname,
        lastname: userDbObj.lastname,
        email: userDbObj.email,
    };

    //generate csrf token of 32 length to generate the access token
    const csrfToken = nanoid(CSRF_TOKEN_LENGTH);

    // create private key by combining JWT secret and csrf token
    const privateKey = process.env.JWT_SECRET + csrfToken;

    // generate an access token and expiry date to be attached to authorization header
    const accessToken = jwt.sign(
        cleanUserData,
        privateKey, 
        { expiresIn: process.env.ACCESS_TOKEN_LIFE }
    );

    // expiry time of the access token
    const expiredAt = moment().add(ms(process.env.ACCESS_TOKEN_LIFE), 'ms').valueOf();

    return {
        accessToken,
        expiredAt,
        csrfToken
    }
}

// generate refresh token from userid and jwt
function genRefreshToken(userid) {
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

// verify csrf token and refresh token
function verifyToken(refreshToken, csrfToken = "", callBack) {
    const privateKey = process.env.JWT_SECRET + csrfToken;
    jwt.verify(refreshToken, privateKey, callBack);
}

// clear refresh and csrf tokens from cookie
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
    genAccessTokenObj,
    genRefreshToken,
    verifyToken,
    clearTokens
}