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


const {
    getUserByEmail
} = require("../controllers/db/auth_db_controller");


// middleware that checks if JWT token exists and verifies it if it does exist.
// this is used for routes when the user is logged in. 
const adminAuthMiddleware = async function (req, res, next) {
    apiDebugAuthMiddleware(req);

    // check header or url parameters or post parameters for accessToken
    var accessToken = req.headers['authorization'];
    if (!accessToken) {
        return handleRes(
            req, 
            res, 
            401,
            {
                error: true,
                resMsg: "Unauthorized Access",
                debugMsg: "No access token in req header authorization"
            }   
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
            {
                error: true,
                resMsg: "Forbidden Access",
                debugMsg: "No csrf token in req header"
            }
        );
    }

    // verify csrf token
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (!refreshToken
        || !(refreshToken in activeRefreshTokenList)
        || activeRefreshTokenList[refreshToken].csrfToken !== csrfToken
    ) {
        return handleRes(
            req,
            res,
            401,
            {
                error: true,
                resMsg: "Unauthorized Access",
                debugMsg: "Either: no csrf token in req header, no refresh token that is active, or invalid refresh token/csrf token"
            }
            
        );
    }

    // verify token with secret key and csrf token
    await verifyToken(accessToken, csrfToken, async (err, payload) => {
        if (err)
            return handleRes(
                req,
                res,
                401,
                {
                    error: true,
                    resMsg: "Unauthorized Access",
                    debugMsg: "User is not at ADMIN Level"
                }
            );
        else {
            req.user = payload; //set the user to req so other routes can use it

            //email can also be taken from activeRefreshTokenList
            const email = payload.email;
            const userDbObj = await getUserByEmail(email);

            //check if user is admin level, then if so, allow pass.
            if (userDbObj.level !== "ADMIN") {
                return handleRes(
                    req,
                    res,
                    401,
                    {
                        error: true,
                        resMsg: "Unauthorized Access",
                        debugMsg: "User is not at ADMIN Level"
                    }
                );
            }
            next();
        }
    });
}


// middleware that checks if JWT token exists and verifies it if it does exist.
// this is used for routes when the user is logged in. 
const csgoAppAuthMiddleware = async function (req, res, next) {
    apiDebugAuthMiddleware(req);

    // check header or url parameters or post parameters for accessToken
    var accessToken = req.headers['authorization'];
    if (!accessToken) {
        return handleRes(
            req,
            res,
            401,
            {
                error: true,
                resMsg: "Unauthorized Access",
                debugMsg: "No access token in req header authorization"
            }
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
            {
                error: true,
                resMsg: "Forbidden Access",
                debugMsg: "No csrf token in req header"
            }
        );
    }

    // verify csrf token
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (!refreshToken
        || !(refreshToken in activeRefreshTokenList)
        || activeRefreshTokenList[refreshToken].csrfToken !== csrfToken
    ) {
        return handleRes(
            req,
            res,
            401,
            {
                error: true,
                resMsg: "Unauthorized Access",
                debugMsg: "Either: no csrf token in req header, no refresh token that is active, or invalid refresh token/csrf token"
            }

        );
    }

    // verify token with secret key and csrf token
    await verifyToken(accessToken, csrfToken, async (err, payload) => {
        if (err)
            return handleRes(
                req,
                res,
                401,
                err
            );
        else {
            req.user = payload; //set the user to req so other routes can use it

            //email can also be taken from activeRefreshTokenList
            const email = payload.email;
            const userDbObj = await getUserByEmail(email);

            //check if user is admin level, then if so, allow pass.
            if (userDbObj.level !== "ADMIN" && userDbObj.level !== "MEMBER") {
                return handleRes(
                    req,
                    res,
                    401,
                    {
                        error: true,
                        resMsg: "Unauthorized Access",
                        debugMsg: "User is not at ADMIN or MEMBER Level"
                    }
                );
            }
            next();
        }
    });
}

module.exports = {
    adminAuthMiddleware,
    csgoAppAuthMiddleware
}