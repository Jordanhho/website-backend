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
function generateAccessToken(userDbObj) {
    return new Promise(resolve => {
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

        //generate xsrf token of 32 length to generate the access token
        const xsrfToken = nanoid(32);

        // create private key by combining JWT secret and xsrf token
        const privateKey = process.env.JWT_SECRET + xsrfToken;

        // generate access token and expiry date
        const refreshToken = jwt.sign(
            cleanUserData,
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

// clear token access, refresh and csrf tokens from cookie
function clearTokens(req, res) {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    delete activeRefreshTokenList[refreshToken];

    res.clearCookie('XSRF-TOKEN');
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
}


// middleware that checks if JWT token exists and verifies it if it does exist.
// this is used for routes when the user is logged in. 
const authMiddleware = function (req, res, next) {
    console.log("auth middleware");
    // check header or url parameters or post parameters for token
    var token = req.headers['authorization'];
    if (!token) return handleRes(req, res, 401);

    token = token.replace('Bearer ', '');

    // get xsrf token from the header
    const xsrfToken = req.headers['xsrf-token'];
    if (!xsrfToken) {
        return handleRes(req, res, 403);
    }

    // verify xsrf token
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (!refreshToken
        || !(refreshToken in activeRefreshTokenList)
        || activeRefreshTokenList[refreshToken] !== xsrfToken
    ) {
        return handleRes(
            req, 
            res, 
            401, 
            err
        );
    }

    // verify token with secret key and xsrf token
    verifyToken(token, xsrfToken, (err, payload) => {
        if (err)
            return handleRes(
                req, 
                res, 
                401, 
                err
            );
        else {
            req.user = payload; //set the user to req so other routes can use it
            next();
        }
    });
}

module.exports = {
    activeRefreshTokenList,
    COOKIE_OPTIONS,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    clearTokens,
    authMiddleware
}