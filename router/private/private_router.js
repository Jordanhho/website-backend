const apiRoutes = require("../api_routes/private_api_routes");

const express = require('express'),
router = express.Router();

//jwt and csrf token auth
const {
    authMiddleware
} = require("../../config/authMiddleware");

const {
    getAdminSettings,
    updateAdminSettings,
    upsertAppDetails,
    removeAppDetailById,
    updateAboutMe
} = require("../../controllers/db/private_db_controller");

const {
    updateLocalAdminSettings
} = require("../../config/admin_settings");

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

/* GET */
//to get settings such as disable add account, emailing
router.get(apiRoutes.GET_ADMIN_SETTINGS, authMiddleware, async (req, res) => {
    let adminSettings = await getAdminSettings();

    if(!adminSettings) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No admin settings data was found",
            }
        );
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Got Admin Home Data",
            data: adminSettings
        }
    );
});



//* POST */
router.post(apiRoutes.UPDATE_ABOUT_ME, authMiddleware, upload.fields(
    [
        { name: 'resume', maxCount: 1 }, 
        { name: 'profile_picture', maxCount: 1 }
    ]), 
    async (req, res) => {

    //check if data is empty
    if (!req.body.education_description
        || !req.body.school_experience_description
        || !req.body.work_experience_description
        || !req.body.skill_specialization_description
        || !req.body.hobby_description
        || !req.body.esports_description
        || !req.body.goal_description
        ) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Missing Required Fields"
            }
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
                    {
                        error:  true,
                        resMsg: "Missing Required Fields",
                        debugMsg: "Invalid resume file format"
                    }
                );
            }

            //upload success to s3
            let result = await uploadToS3(RESUME_BUCKET_KEY, resume.buffer, resume.mimetype);

            if (!result) {
                return handleRes(
                    req,
                    res,
                    200,
                    {
                        error: true,
                        resMsg: "Something went wrong",
                        debugMsg: "Failed to upload resume"
                    }
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
                    {
                        error: true,
                        resMsg: "Missing Required Fields",
                        debugMsg: "Invalid profile picture file format"
                    }
                );
            }

            let result = await uploadToS3(PROFILE_PICTURE_BUCKET_KEY, profile_picture.buffer, profile_picture.mimetype);

            //upload success to s3
            if (!result) {
                return handleRes(
                    req,
                    res,
                    200,
                    {
                        error: true,
                        resMsg: "Something went wrong",
                        debugMsg: "Failed to upload profile photo"
                    }  
                );
            }

            //get signed url and add to update data
            const profilePictureBucketFile = await getS3UrlBucketFile(PROFILE_PICTURE_BUCKET_KEY);
            updateData['profile_picture'] = profilePictureBucketFile;
        }
    }

    //update data portion excluding files.
    let updatedAboutMe = await updateAboutMe(updateData);
    if (!updatedAboutMe) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "Failed to upload profile photo"
            }
        );
    }
    //specifically set resume as resume url and same with profile picture, then remove their objects 
    //remove sensitive information from data
    updatedAboutMe['resume_url'] = updatedAboutMe.resume.url;
    delete updatedAboutMe.resume;
    updatedAboutMe['profile_picture_url'] = updatedAboutMe.profile_picture.url;
    delete updatedAboutMe.profile_picture;

    return handleRes(
        req, 
        res, 
        200,
        {

            debugMsg: "Successfully updated about me data",
            data: updatedAboutMe
        }
    );
});

router.post(apiRoutes.UPDATE_APPS, authMiddleware, async (req, res) => {
    //check if data is empty
    if (!req.body.apps) {
        return handleRes(
            req,
            res,
            200,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing Apps required data"
            }
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
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "Something went wrong with updating apps",
            }
        );
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Successfully updated apps data",
            data: updatedApps
        }
    );
});


router.post(apiRoutes.REMOVE_APP, authMiddleware, async (req, res) => {

    //check if data is empty
    if (!req.body.app_id) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing app id required data"
            }
        );
    }
    const app_id = req.body.app_id;

    let removedApp = await removeAppDetailById(app_id);

    if (!removedApp) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "Something went wrong with removing app"
            }
        );
    }
    return handleRes(
        req,
        res,
        200,
        {
            resMsg: "Successfully removed app",
            debugMsg: "Successfully removed app"
        }
    );
});

//to update ettings such as disable add account, emailing
router.post(apiRoutes.UPDATE_ADMIN_SETTINGS, authMiddleware, async (req, res) => {

    //check if data is empty
    if (!req.body.adminSettings) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing admin settings from req body"
            }
        );
    }

    const adminSettings = req.body.adminSettings;
    let updatedAdminSettings = await updateAdminSettings(adminSettings);

    if (!updatedAdminSettings) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Something went wrong with updating admin home settings"
            }
        );
    }

    //also update local admin settings
    updateLocalAdminSettings(updatedAdminSettings);

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Successfully updated admin home settings",
            data: updatedAdminSettings
        }
    );
});

module.exports = router;