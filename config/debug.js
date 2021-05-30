const NODE_ENV = process.env.NODE_ENV;

function apiDebugMsges(route, req) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("API: " + route);
        if(req.body) {
            console.log("Body: ", req.body);
        }
    }
}

function resDebugMsges(msg, resObj) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log(msg);
        console.log("sending ", resObj);
    }
}

function dbDebugMsges(msg, query = null, doc = null) {    
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log(msg);
        if (query) {
            console.log(query);
        }
        if(doc) {
            console.log("doc: ", doc);
        }
    }
}

function passwordCheckDebugMsges(attemptHashedPassword, hashedPassword) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log("checking passwords: [", attemptHashedPassword, "] : [", hashedPassword, "]")
        console.log("Same password?: [", (attemptHashedPassword === hashedPassword), "]");
    }
}

function sendEmailDebugMsges(msg, emailObj) {
    if (NODE_ENV === "development") {
        console.log("\n");
        console.log(msg);
        if(emailObj) {
            console.log(emailObj);
        }
    }
}

module.exports = {
    apiDebugMsges,
    resDebugMsges,
    dbDebugMsges,
    passwordCheckDebugMsges,
    sendEmailDebugMsges
}
