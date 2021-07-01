const apiRoutes = require("../api_routes/csgo_app_public_api_routes");

const express = require('express'),
router = express.Router();

//jwt and csrf token auth
const {
    csgoAppAuthMiddleware
} = require("../../config/authMiddleware");


const {
    apiDebugMsges
} = require("../../config/debug");

const {
    handleRes
} = require("../response");

const {
    getMaps,
    getMapDetailByMapId,
    getUtilDetailByUtilId,
    getUtilDetailsByMapId
} = require("../../controllers/db/csgo_app_public_db_controller");

const {
    initCsgoMaps,
    initCsgoPublicUtilDetails
} = require("../../controllers/db/init_db_controller");

const {
    getCsgoUtilAppMap,
    getCsgoUtilAppUtilIcon,
    getCsgoUtilPublicImgs
} = require("../../controllers/aws_cloudfront_controller");


const {
    getAppByAppId
} = require("../../controllers/db/public_db_controller");

module.exports = router;