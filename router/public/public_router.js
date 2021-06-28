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
    getApps,
    getAboutMe,
    getResumeDisplay
} = require("../../controllers/db/public_db_controller");

const {
    getAdminSettings,
    updateAboutMe,
    getJordanHo,
    getBucketFileByFileId,
    updateBucketFile
} = require("../../controllers/db/private_db_controller");

const {
    initJordanHo,
    initResumeDisplay,
    initApps,
    initAboutMe
} = require("../../controllers/db/init_db_controller");

const {
    getRenewedS3UrlBucketFile
} = require("../../controllers/aws_s3_controller");

const {
    getCityWeather,
    getWeatherIcon
} = require("../../controllers/open_weather_controller");

const {
    getPublicImage
} = require("../../controllers/aws_cloudfront_controller");


/** GET Requests */
router.get(apiRoutes.LOGIN_SETTINGS, async function (req, res) {
    apiDebugMsges(apiRoutes.LOGIN_SETTINGS, req);
    let adminSettings = await getAdminSettings();

    let data = {
        enable_new_accounts: adminSettings.enable_new_accounts,
        enable_emailing: adminSettings.enable_emailing,
        enable_change_password: adminSettings.enable_change_password
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
            debugMsg: "Sending Login Settings",
            data: data
        }
    );
});

router.get(apiRoutes.HOME, async function (req, res) {
    apiDebugMsges(apiRoutes.HOME, req);
    // const weatherResult = await getCityWeather("Vancouver");
    // const weatherData = weatherResult.data;

    // const homeData = {
    //     city: weatherData.name,
    //     country: weatherData.sys.country,
    //     temperature_degrees: Math.trunc(weatherData.main.temp), //Only whole celcius degrees
    //     weather_description: weatherData.weather[0].description,
    //     icon_url: getWeatherIcon(weatherData.weather[0].icon),
    // }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Home Data",
            data: {}
        }
    );
});

router.get(apiRoutes.ABOUT_ME, async function (req, res) {
    apiDebugMsges(apiRoutes.ABOUT_ME, req);

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

    let aboutMeData = await getAboutMe();
    if (!aboutMeData) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No about me data was found",
            }
        );
    }

    //get profile picture file from file_id
    let profilePicture = await getBucketFileByFileId(aboutMeData.profile_picture_file_id);
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
    //check if need to renew resume file signed url
    let renewedObj = await getRenewedS3UrlBucketFile(profilePicture);
    if (renewedObj) {
        profilePicture = await updateBucketFile(renewedObj);
    }
    const data = aboutMeData;
    data['profile_picture_url'] = profilePicture.bucket_file_signed_url;
    data['firstname'] = jordanHoData.firstname;
    data['lastname'] = jordanHoData.lastname;

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending About Me Data",
            data: data
        }
    );
});

router.get(apiRoutes.APPS, async function (req, res) {
    apiDebugMsges(apiRoutes.APPS, req);

    const appsData = await getApps();
    if (!appsData) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No apps data was found",
            }
        );
    }

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

    const data = {
        apps: appsData,
        github_url: jordanHoData.github_url
    };
    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Apps Data",
            data: data
        }
    );
});

router.get(apiRoutes.RESUME_DISPLAY, async function (req, res) {
    apiDebugMsges(apiRoutes.RESUME_DISPLAY, req);

    let resumeDisplay = await getResumeDisplay();

    if (!resumeDisplay) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No resume display data was found",
            }
        );
    }

    //get resume file from file_id
    let resume = await getBucketFileByFileId(resumeDisplay.resume_file_id);
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
    //check if need to renew resume file signed url
    let renewedObj = await getRenewedS3UrlBucketFile(resume);
    if (renewedObj) {
        resume = await updateBucketFile(renewedObj);
    }
    const data = resumeDisplay;
    data['resume_url'] = resume.bucket_file_signed_url;

    //remove resume file id
    delete data.resume_file_id;

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Resume Display Data",
            data: data
        }
    );
});


router.get(apiRoutes.CONTACT_ME, async function (req, res) {
    apiDebugMsges(apiRoutes.CONTACT_ME, req);
    const jordanHoData = await getJordanHo();

    if (!jordanHoData) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No contact me data was found",
            }
        );
    }
    const data = {
        email: jordanHoData.email,
        crossfire_profile_url: jordanHoData.email,
        youtube_url: jordanHoData.youtube_url,
        linkedin_url: jordanHoData.linkedin_url,
        github_url: jordanHoData.github_url,
        twitch_url: jordanHoData.twitch_url,
        steam_url: jordanHoData.steam_url,
        esea_url: jordanHoData.esea_url,
    }
    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending Contact Me Data",
            data: data
        }
    );
});



router.get(apiRoutes.ABOUT_WEBSITE, async function (req, res) {
    apiDebugMsges(apiRoutes.ABOUT_WEBSITE, req);

    const jordanHoData = await getJordanHo();

    if (!jordanHoData) {
        return handleRes(
            req,
            res,
            200,
            {
                error: true,
                resMsg: "Something went wrong",
                debugMsg: "No contact me data was found",
            }
        );
    }

    const data = {
        website_backend_github_url: jordanHoData.website_backend_github_url,
        website_frontend_github_url: jordanHoData.website_frontend_github_url,
        technologies: {
            reactjs: {
                url: "https://reactjs.org/",
                logo: getPublicImage("reactjs_logo.png")
            },
            redux: {
                url: "https://react-redux.js.org/",
                logo: getPublicImage("redux_logo.png")
            },
            material_ui: {
                url: "https://material-ui.com/",
                logo: getPublicImage("material_ui_logo.png")
            },
            fontawesome: {
                url: "https://fontawesome.com/",
                logo: getPublicImage("fontawesome_logo.png")
            },
            expressjs: {
                url: "https://expressjs.com/",
                logo: getPublicImage("expressjs_logo.png")
            },
            mongodb: {
                url: "https://www.mongodb.com/",
                logo: getPublicImage("mongodb_logo.png")
            },
            aws_s3: {
                url: "https://aws.amazon.com/s3/",
                logo: getPublicImage("aws_s3_logo.png")
            },
            aws_cloudfront: {
                url: "https://aws.amazon.com/cloudfront/",
                logo: getPublicImage("aws_cloudfront_logo.png")
            },
            nodejs: {
                url: "https://nodejs.org/en/",
                logo: getPublicImage("nodejs_logo.png")
            },
            nginx: {
                url: "https://www.nginx.com/",
                logo: getPublicImage("nginx_logo.png")
            }
        }
    }

    return handleRes(
        req,
        res,
        200,
        {
            debugMsg: "Sending About Website Data",
            data: data
        }
    );
});



// router.get("/api/test", async function (req, res) {
//     //await initResumeDisplay();
//     //await initApps();
//     // await initAboutMe();

//     return handleRes(
//         req,
//         res,
//         200,
//         {
//             debugMsg: "Init test data"
//         }
//     );
// });

module.exports = router;







