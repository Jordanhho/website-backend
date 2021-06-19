const fetch = require('node-fetch');

const NODE_ENV = process.env.NODE_ENV;

//set the google recaptcha keys depending on the development environment
const RECAPTCHA_SECRET_KEY = (NODE_ENV === "development") ? process.env.RECAPTCHA_TEST_SECRET_KEY : process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_INVISIBLE_SECRET_KEY = (NODE_ENV === "development") ? process.env.RECAPTCHA_TEST_INVISIBLE_SECRET_KEY : process.env.RECAPTCHA_INVISIBLE_SECRET_KEY;

const {
    recaptchaDebugMsgs
} = require("./debug");

//returns true or false if recaptcha has been verified
function verifyRecaptcha(req) {
    return new Promise((resolve, reject)=> {
        if (!req.body.recaptcha_token || !req.connection.remoteAddress) {
            recaptchaDebugMsgs("No Recaptcha Token found in req body.");
            resolve(false);
        }

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${req.body.recaptcha_token}&remoteip=${req.connection.remoteAddress}`;

        fetch(url, {
            method: "post",
        })
        .then((res) => res.json()).then((google_res) => {
                if (google_res.success == true) {
                    recaptchaDebugMsgs("Successfully verified recaptcha token");
                    resolve(true);
                } else {
                    recaptchaDebugMsgs("Failed to verify recaptcha token ", google_res);
                    resolve(false);
                }
            })
            .catch((error) => {
                recaptchaDebugMsgs(error);
                resolve(false);
            });
        });

    // // let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // // Hitting GET request to the URL, Google will respond with success or error scenario.
    // await request(verificationUrl, function (error, response, body) {
    //     body = JSON.parse(body);
    //     // Success will be true or false depending upon captcha validation.
    //     if (body.success !== undefined && !body.success) {
    //         return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
    //     }
    //     return res.json({ "responseCode": 0, "responseDesc": "Success" });
    // });
}


//returns true or false if recaptcha has been verified
function verifyInvisibleRecaptcha(req) {
    return new Promise((resolve, reject) => {

        if (!req.body.recaptcha_token || !req.connection.remoteAddress) {
    
            resolve(false);
        }

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_INVISIBLE_SECRET_KEY}&response=${req.body.recaptcha_token}&remoteip=${req.connection.remoteAddress}`;

        fetch(url, {
            method: "post",
        })
            .then((res) => res.json()).then((google_res) => {
                if (google_res.success == true) {
                    recaptchaDebugMsgs("Successfully verified recaptcha token");
                    resolve(true);
                } else {
                    recaptchaDebugMsgs("Failed to verify recaptcha token ", google_res);
                    resolve(false);
                }
            })
            .catch((error) => {
                recaptchaDebugMsgs(error);
                resolve(false);
            });
    });
}

module.exports = {
    verifyRecaptcha,
    verifyInvisibleRecaptcha
};
