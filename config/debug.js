const NODE_ENV = process.env.NODE_ENV;

const moment = require("moment");

function printTimeStamp() {
    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
}

function apiDebugMsges(route, req) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("API: " + route);
        printTimeStamp();
        if(req.body) {
            console.log("Body: ", req.body);
        }
        if(req.file) {
            console.log("File: ", req.file);
        }
    }
}

function apiDebugAuthMiddleware(req) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("====== Auth Middleware ======");
        console.log("API: " + req.route.path);
        printTimeStamp();
        if (req.body) {
            console.log("Body: ", req.body);
        }
    }
}

function resDebugMsges(msg, resObj) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("RES:", msg);
        console.log("sending ", resObj);
    }
}

function dbDebugMsges(msg, query = null, doc = null) {    
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("DB: ", msg);
        // if (query) {
        //     console.log(query);
        // }
        // if(doc) {
        //     console.log("doc: ", doc);
        // }
    }
}

function passwordCheckDebugMsges(attemptPassword, isSamePassword) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("Checking password for: ", attemptPassword);
        console.log("Matches password in db? ", isSamePassword);
    }
}

function sendEmailDebugMsges(msg, emailObj) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("EMAIL: ", msg);
        printTimeStamp();
        if(emailObj) {
            console.log(emailObj);
        }
    }
}

function awsS3DebugMsges(msg, data) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("AWS S3: ", msg, data);
        printTimeStamp();
    }
}

function recaptchaDebugMsgs(msg, data) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("RECAPTCHA: ", msg);
        if(data) {
            console.log(data);
        }
        printTimeStamp();
    }
}

function weatherApiDebugMsges(msg) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("WEATHERAPI: ", msg);
    }
}

module.exports = {
    apiDebugMsges,
    apiDebugAuthMiddleware,
    resDebugMsges,
    dbDebugMsges,
    passwordCheckDebugMsges,
    sendEmailDebugMsges,
    awsS3DebugMsges,
    recaptchaDebugMsgs,
    weatherApiDebugMsges
}
