const apiRoutes = require("../api_routes/public_api_routes");

const express = require('express'),
router = express.Router();

const {
    apiDebugMsges
} = require("../../config/debug");

const {
    handleRes
} = require("../response");

const {
    getAboutMe,
} = require("../../controllers/db/public_db_controller");

const {
    updateAboutMe
} = require("../../controllers/db/private_db_controller");

const {
    getRenewedS3UrlBucketFile
} = require("../../controllers/aws_s3_controller");

//** GET REQUESTS **//
router.get(apiRoutes.HOME, function (req, res) {
    
});

router.get(apiRoutes.ABOUT_ME, async function (req, res) {
    apiDebugMsges(apiRoutes.ABOUT_ME, req);
    let data = await getAboutMe();

    if(!data) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Something went wrong",
        );
    }

    //check if resume or profile picture url has expired, if so renew it and save it into the db.
    Promise.all([
        getRenewedS3UrlBucketFile(data.resume),
        getRenewedS3UrlBucketFile(data.profile_picture)
    ]).then(async (dataList) => {
        const renewedResume = dataList[0];
        const renewedProfilePicture = dataList[1];

        let updateData = data;
        let updateFlag = false;

        //if fields are not null, then that means they expired, update with new url.
        if(renewedResume) {
            updateFlag = true;
            updateData.resume = renewedResume;
        }
        if(renewedProfilePicture) {
            updateFlag = true;
            updateData.profile_picture = renewedProfilePicture;
        }
        if(updateFlag) {
            const updatedData = await updateAboutMe(updateData);
            //set updatedData as just data to return
            data = updatedData;
        }

        //specifically set resume as resume url and same with profile picture, then remove their objects 
        //remove sensitive information from data
        data['resume_url'] = data.resume.url;
        data['profile_picture_url'] = data.profile_picture.url;
        delete data.resume;
        delete data.profile_picture;
        delete data._id;
        delete data.__v;

        console.log("returning: ", data);

        return handleRes(
            req,
            res,
            200,
            null,
            "Sending About Me Data",
            data
        );
    });
});


router.get(apiRoutes.APPS, function (req, res) {

});

module.exports = router;







