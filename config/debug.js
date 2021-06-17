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
        // if(req.body) {
        //     console.log("Body: ", req.body);
        // }
        // if(req.file) {
        //     console.log("File: ", req.file);
        // }
    }
}

function apiDebugAuthMiddleware(req) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("====== Auth Middleware ======");
        console.log("API: " + req.route.path);
        printTimeStamp();
        // if (req.body) {
        //     console.log("Body: ", req.body);
        // }
    }
}

function resDebugMsges(msg, resObj) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("RES:", msg);
        // console.log("sending ", resObj);
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

async function passwordCheckDebugMsges(attemptPassword, isSamePassword) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("Checking password for: ", attemptPassword);
        console.log("Matches password in db? ", isSamePassword);
    }
}

function sendEmailDebugMsges(msg, emailObj) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log(msg);
        printTimeStamp();
        if(emailObj) {
            console.log(emailObj);
        }
    }
}

module.exports = {
    apiDebugMsges,
    apiDebugAuthMiddleware,
    resDebugMsges,
    dbDebugMsges,
    passwordCheckDebugMsges,
    sendEmailDebugMsges,
}
