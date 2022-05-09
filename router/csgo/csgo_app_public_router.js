const apiRoutes = require("../api_routes/csgo_app_public_api_routes");

const express = require('express'),
router = express.Router();

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


/** GET Requests */
router.get(apiRoutes.HOME, async function (req, res) {
    apiDebugMsges(apiRoutes.HOME, req);

    let appDetails = await getAppByAppId("csgo_utility_app");

    if (!appDetails) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Something went wrong",
            }
        );
    }

    let data = {
        supported_maps: [
            'Dust 2', 'Mirage', 'Nuke', 'Inferno', 'Train', 'Vertigo', 'Overpass', 'Ancient'
        ],
        github_url: appDetails.github_url
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Maps",
            data: data
        }
    );
});

router.get(apiRoutes.MAPS, async function (req, res) {
    apiDebugMsges(apiRoutes.MAPS, req);
    let maps = await getMaps();

    let data = {
        maps: maps
    }

    if (!data) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Something went wrong",
            }
        );
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Maps",
            data: data
        }
    );
});


/** POST Requests */

//get map details by id
router.post(apiRoutes.PUBLIC_MAP_DETAIL, async function (req, res) {
    apiDebugMsges(apiRoutes.PUBLIC_MAP_DETAIL, req);

    //check if req.body is empty
    if (!req.body || Object.keys(req.body).length <= 0 || !req.body.map_id) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing public map details fields"
            }
        );
    }

    const map_id = req.body.map_id;

    //get map details
    let mapDetail = await getMapDetailByMapId(map_id);

    //get all public utils that are associated with this map id
    const is_private = false;
    let utilDetails = await getUtilDetailsByMapId(map_id, is_private);
    if (!utilDetails || !mapDetail) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Something went wrong",
            }
        );
    }

    let data = {
        utilDetails: utilDetails,
        cloudfront_map_url: getCsgoUtilAppMap(map_id),
        map_id: mapDetail.map_id,
        map_name: mapDetail.map_name,
        util_icons: {
            smoke: getCsgoUtilAppUtilIcon("smoke"),
            incendiary: getCsgoUtilAppUtilIcon("incendiary"),
            flash: getCsgoUtilAppUtilIcon("flash"),
            molotov: getCsgoUtilAppUtilIcon("molotov"),
            grenade: getCsgoUtilAppUtilIcon("grenade")
        }
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Map Detail",
            data: data
        }
    );
});


//get util by id
router.post(apiRoutes.PUBLIC_UTIL_DETAIL, async function (req, res) {
    apiDebugMsges(apiRoutes.PUBLIC_UTIL_DETAIL, req);

    //check if req.body is empty
    if (!req.body || Object.keys(req.body).length <= 0 || !req.body.util_id) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing public util details fields"
            }
        );
    }

    const util_id = req.body.util_id;
    const is_private = false;
    let utilDetail = await getUtilDetailByUtilId(util_id, is_private);
    if (!utilDetail) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Something went wrong",
            }
        );
    }

    //since its public, using the util id, 
    let images = getCsgoUtilPublicImgs(util_id);
    console.log(utilDetail);

    //get the icon of util
    let cloudfront_util_icon_url = getCsgoUtilAppUtilIcon(utilDetail.util_type)

    let data = {
        utilDetail: utilDetail,
        cloudfront_util_icon_url: cloudfront_util_icon_url,
        images: images
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Util Details",
            data: data
        }
    );
});

// router.get("/api/csgo-app/test", async function (req, res) {
//     console.log("test");
//     await initCsgoPublicUtilDetails();

//     return handleRes(
//         req,
//         res,
//         200,
//         {
//             debugMsg: "Init data"
//         }
//     );
// })

module.exports = router;







