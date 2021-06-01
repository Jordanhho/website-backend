const {
    clearTokens
} = require("../config/csrf_jwt_utils"); 

const {
    resDebugMsges
} = require("../config/debug");


// handle the API response
function handleRes(req, res, statusCode, resMsg, debugMsg = null, data = false) {
    let isError = false;

    let errorMsg = resMsg;
    
    if(!resMsg) {
        errorMsg = null;
    }

    switch (statusCode) {
        // No content
        case 204:
            return res.sendStatus(204);
        //Bad request
        case 400:
            isError = true;
            break;
        // Unauthorized
        case 401:
            isError = true;
            errorMsg = resMsg || 'Invalid user.';
            clearTokens(req, res);
            break;
        // Forbidden
        case 403:
            isError = true;
            errorMsg = resMsg || 'Access to this resource is denied.';
            clearTokens(req, res);
            break;
        // Conflict
        case 409:
            isError = true;
            errorMsg = resMsg || 'Conflicting Data';
            clearTokens(req, res);
            break;
        default:
            break;
    }

    const resObj = data || {};

    //use debugMsg if it exists otherwise use resMsg
    resDebugMsges(((debugMsg) ? debugMsg: resMsg), resObj);

    if (isError) {
        resObj.error = true;

        if (errorMsg) {
            resObj.msg = errorMsg;
        }
    }
    return res.status(statusCode).json(resObj);
}

module.exports = {
    handleRes
}