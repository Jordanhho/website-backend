const AboutMe = require("../../db/models/public/aboutMe");

const {
    dbDebugMsges
} = require("../../config/debug");

/** about me data manipulation */

async function insertAboutMe(data) {
    try {
        const aboutMe = new AboutMe(data);
        const doc = await new Promise((resolve, reject) => {
            aboutMe.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateAboutMe(data) {
    console.log(data);
    try {
        const doc = await AboutMe.findOneAndUpdate(
            {},
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such aboutMe data found");
            return null;
        }
        dbDebugMsges("Successfully updated aboutMe data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    insertAboutMe,
    updateAboutMe
}