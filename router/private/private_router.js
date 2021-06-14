const apiRoutes = require("../api_routes/private_api_routes");

const express = require('express'),
router = express.Router();

//jwt and csrf token auth
const {
    authMiddleware
} = require("../../config/authMiddleware");

const {
    upsertAppDetails,
    removeAppDetailById,
    updateAboutMe
} = require("../../controllers/db/private_db_controller");

const {
    handleRes
} = require("../response");

const {
    upload,
    uploadToS3,
    getS3UrlBucketFile
} = require("../../controllers/aws_s3_controller");

const RESUME_BUCKET_KEY = "jordan_resume.pdf";
const PROFILE_PICTURE_BUCKET_KEY = "jordan_profile_picture.jpg";

router.post(apiRoutes.UPDATE_ABOUT_ME, authMiddleware, upload.fields(
    [
        { name: 'resume', maxCount: 1 }, 
        { name: 'profile_picture', maxCount: 1 }
    ]), 
    async (req, res) => {

    //check if data is empty
    if (!req.body.education_description
        || !req.body.experience_description
        || !req.body.specialization_description
        || !req.body.hobby_description
        ) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Missing Required Fields"
        );
    }
    let updateData = req.body;

    //if resume exists, upload, with file name: Jordan_Ho_resume.pdf
    if (req.files) {
        let resume = req.files.resume;
        if(resume) {
            resume = resume[0];
            //invalid file format
            if (resume.mimetype !== "application/pdf" ) {
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "Missing Required Fields",
                    "Invalid resume file format"
                );
            }

            //upload success to s3
            let result = await uploadToS3(RESUME_BUCKET_KEY, resume.buffer, resume.mimetype);

            if (!result) {
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "Failed to upload resume"
                );
            }

            //get signed url and add to update data
            const resumeBucketFile = await getS3UrlBucketFile(RESUME_BUCKET_KEY);
            updateData['resume'] = resumeBucketFile;
        }

        let profile_picture = req.files.profile_picture;
        if (profile_picture) {
            profile_picture = profile_picture[0];
            
            //invalid file format
            if (profile_picture.mimetype !== "image/png"
                && profile_picture.mimetype !== "image/jpeg"
                && profile_picture.mimetype !== "image/jpg"
            ) {
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "Missing Required Fields",
                    "Invalid profile picture file format"
                );
            }

            let result = await uploadToS3(PROFILE_PICTURE_BUCKET_KEY, profile_picture.buffer, profile_picture.mimetype);

            //upload success to s3
            if (!result) {
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "Failed to upload profile photo"
                );
            }

            //get signed url and add to update data
            const profilePictureBucketFile = await getS3UrlBucketFile(PROFILE_PICTURE_BUCKET_KEY);
            updateData['profile_picture'] = profilePictureBucketFile;
        }
    }

    //update data portion excluding files.
    const updatedAboutMe = await updateAboutMe(updateData);
    if (!updatedAboutMe) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Something went wrong with updating about me",
            {
                update: true
            }
        );
    }

    return handleRes(
        req, 
        res, 
        200,
        null,
        "Successfully updated about me data",
        updatedAboutMe
    );
});

router.post(apiRoutes.UPDATE_APPS, authMiddleware, async (req, res) => {
    //check if data is empty
    if (!req.body.apps) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Missing Required Fields"
        );
    }
    const appList = req.body.apps;

    let updatedApps = [];

    await Promise.all(appList.map(async (appDetails, index) => {
        //update each app in parallel
        let updatedAppDetails = await upsertAppDetails(appDetails);
        updatedApps.push(updatedAppDetails);
    }));

    if (!updatedApps) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Something went wrong with updating apps",
            {
                update: true
            }
        );
    }

    return handleRes(
        req,
        res,
        200,
        null,
        "Successfully updated apps data",
        updatedApps
    );
});


router.post(apiRoutes.REMOVE_APP, authMiddleware, async (req, res) => {

    //check if data is empty
    if (!req.body.app_id) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Missing Required Fields"
        );
    }
    const app_id = req.body.app_id;

    let removedApp = await removeAppDetailById(app_id);

    if (!removedApp) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Something went wrong with removing app"
        );
    }
    return handleRes(
        req,
        res,
        200,
        null,
        "Successfully removed app"
    );
});
module.exports = router;