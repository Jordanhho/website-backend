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
    updateAboutMe,
    updateResumeDisplay,
    updateJordanHo,
    getJordanHo,
    getBucketFileByFileId,
    updateBucketFile
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
    getS3UrlBucketFile,
    getRenewedS3UrlBucketFile
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
router.post(apiRoutes.UPDATE_ABOUT_ME, authMiddleware, async (req, res) => {

    //check if data is empty
    if (!req.body || Object.keys(req.body).length <= 0) {
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

    const updatedAboutMe = await updateAboutMe(updateData);
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
    let data = updatedAboutMe;
    return handleRes(
        req, 
        res, 
        200,
        {
            debugMsg: "Successfully updated about me data",
            data: data
        }
    );
});

router.post(apiRoutes.UPDATE_APPS, authMiddleware, async (req, res) => {
    //check if data is empty
    if (!req.body || Object.keys(req.body).length <= 0) {
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
    const appsData = req.body;

    //if github link needs to be updated:
    const github_url = req.body.github_url;
    const updated_github_url = await updateJordanHo({"github_url": github_url});
    if (!updated_github_url) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "Something went wrong with updating main github url",
            }
        );
    }

    let updatedApps = [];

    await Promise.all(appsData.apps.map(async (appDetails, index) => {
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

    let data = {
        "apps": updatedApps,
        "github_url": updated_github_url
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Successfully updated apps data",
            data: data
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


router.post(apiRoutes.UPDATE_RESUME_DISPLAY, authMiddleware, async (req, res) => {

    //check if req.body is empty
    if (!req.body || Object.keys(req.body).length <= 0) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing resume display fields"
            }
        );
    }

    const resumeDisplayData = req.body;
    const updatedResumeDisplayData = await updateResumeDisplay(resumeDisplayData);

    if (!updatedResumeDisplayData) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                debugMsg: "Something went wrong with updating resume display data"
            }
        );
    }
    let data = updatedResumeDisplayData;

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Successfully updated resume display",
            data
        }
    );
});



router.post(apiRoutes.GET_JORDAN_HO, authMiddleware, async (req, res) => {
    const jordanHoData = await getJordanHo();
    if (!jordanHoData) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No jordan ho data was found",
            }
        );
    }

    let profilePicture = await getBucketFileByFileId(jordanHoData.profile_picture_file_id);
    if (!profilePicture) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No profile picture bucket file was found",
            }
        );
    }
    let renewedObj = await getRenewedS3UrlBucketFile(profilePicture);
    if (renewedObj) {
        profilePicture = await updateBucketFile(renewedObj);
    }

    let resume = await getBucketFileByFileId(jordanHoData.resume_file_id);
    if (!resume) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No resume bucket file was found",
            }
        );
    }
    renewedObj = await getRenewedS3UrlBucketFile(resume);
    if (renewedObj) {
        resume = await updateBucketFile(renewedObj);
    }

    let data = jordanHoData;
    data['profile_picture_url'] = profilePicture.bucket_file_signed_url;
    data['resume_url'] = resume.bucket_file_signed_url;

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Jordan Ho Data",
            data
        }
    );
});

router.post(apiRoutes.UPDATE_JORDAN_HO, authMiddleware, 
    upload.fields(
    [
        { name: 'resume', maxCount: 1 },
        { name: 'profile_picture', maxCount: 1 }
    ]),
    async (req, res) => {

    //check if req.body is empty
    if (!req.body || Object.keys(req.body).length <= 0) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Missing Required Fields",
                debugMsg: "Missing Jordan Ho fields"
            }
        );
    }
    const jordanHoData = req.body;


    const updatedJordanHoData = await updateJordanHo(jordanHoData);

    let resume = null;
    let profilePicture = null;

    //if resume exists, upload, with file name: Jordan_Ho_resume.pdf
    if (req.files) {
        if (req.files.resume) {
            resume = req.files.resume[0];
            //invalid file format
            if (resume.mimetype !== "application/pdf") {
                return handleRes(
                    req,
                    res,
                    200,
                    {
                        error: true,
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

            //get signed url 
            resume = await getS3UrlBucketFile(RESUME_BUCKET_KEY);
        }

        if (req.files.profile_picture) {
            profile_picture = req.files.profile_picture[0];

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

            //get signed url
            profilePicture = await getS3UrlBucketFile(PROFILE_PICTURE_BUCKET_KEY);
        }
    }

    let data = updatedJordanHoData;
    //add file data to data
    if(profilePicture) {
        data['profile_picture_url'] = profilePicture;
    }
    if(resume) {
        data['resume_url'] = resume;
    }
    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Successfully updated  Jordan Ho Data",
            data
        }
    );
});

module.exports = router;