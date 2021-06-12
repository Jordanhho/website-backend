const AboutMe = require("../../db/models/public/aboutMe");

const {
    dbDebugMsges
} = require("../../config/debug");

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
    getAboutMe
}