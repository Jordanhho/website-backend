const apiRoutes = require("../api_routes/private_api_routes");

const express = require('express'),
    router = express.Router();

//jwt and csrf token auth
const {
    activeRefreshTokenList,
    verifyToken,
    authMiddleware
} = require("../../config/csrf_jwt_utils");

const {
    handleRes
} = require("../response");


//template
// app.get(apiRoutes.updateMe, UPDATE_ABOUT_ME, (req, res) => {
    
//     //return handleRes(req, res, 200, { random: Math.random(), userList: list });
// });






module.exports = router;