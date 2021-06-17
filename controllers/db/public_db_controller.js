const AboutMe = require("../../db/models/public/aboutMe");
const AppDetails = require("../../db/models/public/appDetails");

const {
    dbDebugMsges
} = require("../../config/debug");

const { 
    getNormalObjectArray
} = require("./db_utility");

//gets all apps
async function getApps() {
    try {
        const docs = await AppDetails.find();
        if (!docs) {
            dbDebugMsges("No apps found");
            return null;
        }
        dbDebugMsges("Retrived all apps details", docs);

        //convert all docs into normal objects.
        return getNormalObjectArray(docs);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getAboutMe() {
    try {
        const doc = await AboutMe.findOne();
        if (!doc) {
            dbDebugMsges("No such aboutMe data found");
            return null;
        }
        dbDebugMsges("Successfully found aboutMe data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    getApps,
    getAboutMe
}