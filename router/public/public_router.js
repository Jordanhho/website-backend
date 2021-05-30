const apiRoutes = require("../api_routes/public_api_routes");

const express = require('express'),
router = express.Router();

const {
    handleRes
} = require("../response");


//** GET REQUESTS **//
router.get(apiRoutes.HOME, function (req, res) {
    

});

router.get(apiRoutes.ABOUT_ME, function (req, res) {
    let apiData = {
        "description": "TODO DESCRIPTION",
        "linkedin_url": "https://www.linkedin.com/in/jordanhho/",
        "email": "jordanhho@gmail.com",
        "youtube_url": "https://www.youtube.com/channel/UC8MYJwWZQr6c6Ryjkt6vv4Q",
        "github_url": "https://github.com/Jordanhho",
        "resume_url": "",
    }

    return handleRes(req, res, 200, apiData);
});


router.get(apiRoutes.APPS, function (req, res) {

});


module.exports = router;







