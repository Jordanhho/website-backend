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
} = require("../../controllers/db/public_db_controller");

const {
    getAdminSettings,
    updateAboutMe
} = require("../../controllers/db/private_db_controller");

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

const { 
    reverseStr
} = require("../../utility/helper");


/** GET Requests */
router.get(apiRoutes.LOGIN_SETTINGS, async function (req, res) {
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
    const weatherResult = await getCityWeather("Vancouver");
    const weatherData = weatherResult.data;

    const homeData = {
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature_degrees: Math.trunc(weatherData.main.temp), //Only whole celcius degrees
        weather_description: weatherData.weather[0].description,
        icon_url: getWeatherIcon(weatherData.weather[0].icon),
        website_github: {
            backend_url: "https://github.com/Jordanhho/website-backend",
            frontend_url: "https://github.com/Jordanhho/website-frontend"
        },
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
            debugMsg: "Sending Home Data",
            data: homeData
        }
    );
});

router.get(apiRoutes.ABOUT_ME, async function (req, res) {
    apiDebugMsges(apiRoutes.ABOUT_ME, req);
    let data = await getAboutMe();

    if(!data) {
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
        if(data.resume) {
            data['resume_url'] = data.resume.url;
            delete data.resume;
        }
        if (data.profile_picture) {
            data['profile_picture_url'] = data.profile_picture.url;
            delete data.profile_picture;
        }

        delete data._id;
        delete data.__v;

        //obfuscate the email by reversing the string, then re-reversing on frontend.
        data.email = reverseStr(data.email);

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
});

router.get(apiRoutes.APPS, async function (req, res) {
    apiDebugMsges(apiRoutes.APPS, req);

    let data = await getApps();

    if (!data) {
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

    //remove sensitive information
    for(let i = 0; i < data.length; i++) {
        delete data[i]._id;
        delete data[i].__v;
    }

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

module.exports = router;







