const {
    activeRefreshTokenList,
    verifyToken
} = require("./csrf_jwt_utils");

const {
    handleRes
} = require("../router/response");

const {
    apiDebugAuthMiddleware
} = require("./debug");

// middleware that checks if JWT token exists and verifies it if it does exist.
// this is used for routes when the user is logged in. 
const authMiddleware = function (req, res, next) {
    // apiDebugAuthMiddleware(req);

    // check header or url parameters or post parameters for accessToken
    var accessToken = req.headers['authorization'];
    if (!accessToken) {
        return handleRes(
            req, 
            res, 
            401,
            "no access token in req header authorization"
        );
    }
   
    accessToken = accessToken.replace('Bearer ', '');

    // get csrf token from the header
    const csrfToken = req.headers['x-xsrf-token'];
    if (!csrfToken) {
        return handleRes(
            req, 
            res, 
            403,
            "No csrf token in req header"
        );
    }

    // verify csrf token
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (!refreshToken
        || !(refreshToken in activeRefreshTokenList)
        || activeRefreshTokenList[refreshToken] !== csrfToken
    ) {
        return handleRes(
            req,
            res,
            401,
            "Either: no csrf token in req header, no refresh token that is active, or invalid refresh token/csrf token"
        );
    }

    // verify token with secret key and csrf token
    verifyToken(accessToken, csrfToken, (err, payload) => {
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
    authMiddleware
}