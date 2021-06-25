const AboutMe = require("../../db/models/public/aboutMe");
const AppDetails = require("../../db/models/public/appDetails");
const ResumeDisplay = require("../../db/models/public/ResumeDisplay");

const {
    dbDebugMsges
} = require("../../config/debug");

const { 
    getNormalObjFromDoc
} = require("./db_utility");

//gets all apps
async function getApps(safe = true) {
    try {
        const docs = await AppDetails.find().lean();
        if (!docs) {
            dbDebugMsges("No apps found");
            return null;
        }
        dbDebugMsges("Retrived all apps details", docs);
        return getNormalObjFromDoc(docs, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getAboutMe(safe = true) {
    try {
        const doc = await AboutMe.findOne().lean();
        if (!doc) {
            dbDebugMsges("No such aboutMe data found");
            return null;
        }
        dbDebugMsges("Successfully found aboutMe data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getResumeDisplay(safe = true) {
    try {
        const doc = await ResumeDisplay.findOne().lean();
        if (!doc) {
            dbDebugMsges("No such ResumeDisplay data found");
            return null;
        }
        dbDebugMsges("Successfully found ResumeDisplay data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    getApps,
    getAboutMe,
    getResumeDisplay
}