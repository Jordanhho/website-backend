const apiRoutes = require("../api_routes/private_api_routes");

const express = require('express'),
router = express.Router();

//jwt and csrf token auth
const {
    authMiddleware
} = require("../../config/authMiddleware");

const {
    updateAboutMe,
    insertAboutMe 
} = require("../../controllers/db/private_db_controller");

const {
    apiDebugMsges
} = require("../../config/debug");

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

router.get("/api/test", async (req, res) => {

    const initData = {
        firstname: "Jordan",
        lastname: "Ho",
        email: "jordanhho@gmail.com",
        education_description: "I have a Bachelor of applied science degree from Simon Fraser. I major in computer science that specializes in software systems. I also have taken a BCIT course with Cisco IT admin training.",
        experience_description: "I have worked on several school projects to create web applications about scheduling, monitoring elevators, and site report writer. I have also done 2 co-ops where one is a full stack developer position and the other is a front-end only position. Through the full-stack position, I have worked on an education management system with my school to help professors and students manage school resources. At the front-end position, I have made many advancements and improvements on their man application.",
        specialization_description: "I find developing web applications really fun, especially when knowing the application is going to be useful for many people. I have fun optimizing and improving and existing applications while putting out my own ideas. I also really enjoy building a completely new application from the ground up while working with a serious team. Of course, constructing a completely new app is always tedious but these experiences are fun and valuable that I would like take my web development skills to the next level at my next job.",
        hobby_description: "I have previously competed professionally in the first-person shooter called Crossfire. This game requires reflexes, knowledge, the ability to think fast on your feet, and most importantly teamwork and communication. Through fierce competition, I have built up my communication and teamwork skills to work with many different players that I have also found that are easily applied to both school group work and at my co-ops. I have also competed as a high level amateur in csgo on ESEA main level league team. These skills honed at the game have helped me build a good work ethic and the ability to communicate and work with others well. In the end, I really like playing first-person shooters that are highly competitive that requires a high level of teamwork.",
        linkedin_url: "https://www.linkedin.com/in/jordanhho/",
        github_url: "https://github.com/Jordanhho",
        resume_url: "resume_link",
        youtube_url: "https://www.youtube.com/channel/UC8MYJwWZQr6c6Ryjkt6vv4Q",
        twitch_url: "https://www.twitch.tv/yuukicf",
        steam_url: "https://steamcommunity.com/profiles/76561198022667905",
        crossfire_profile_url: "https://www.crossfirestars.com/en/stats/player?playerNo=3298",
        esea_url: "https://play.esea.net/users/2282189",
    }

    insertAboutMe(initData);
    return;
});


//upload.single("resume");
router.post(apiRoutes.UPDATE_ABOUT_ME, authMiddleware, upload.fields(
    [
        { name: 'resume', maxCount: 1 }, 
        { name: 'profile_picture', maxCount: 1 }
    ]), 
    async (req, res) => {
    // apiDebugMsges(apiRoutes.UPDATE_ABOUT_ME, req);

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

module.exports = router;