const {
    clearTokens
} = require("../config/csrf_jwt_utils"); 

const {
    resDebugMsges
} = require("../config/debug");


// handle the API response
function handleRes(req, res, statusCode, resObj) {
    let error = resObj.error || false;
    let resMsg = resObj.resMsg || null;
    let debugMsg = resObj.debugMsg || null;
    let data = resObj.data || {}

    switch (statusCode) {
        // No content
        case 204:
            error = true;
        //Bad request
        case 400:
            error = true;
            break;
        // Unauthorized
        case 401:
            error = true;
            clearTokens(req, res);
            break;
        // Forbidden
        case 403:
            error = true;
            clearTokens(req, res);
            break;
        // Conflict
        case 409:
            error = true;
            clearTokens(req, res);
            break;
        default:
            break;
    }

    const returnObj = {
        error: error,
        msg: resMsg,
        data: data || {}
    };

    //use debugMsg if it exists otherwise use resMsg
    resDebugMsges(debugMsg || resMsg, returnObj);
    return res.status(statusCode).json(returnObj);
}

module.exports = {
    handleRes
}