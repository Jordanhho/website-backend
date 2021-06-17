const AboutMe = require("../../db/models/public/aboutMe");
const AppDetails = require("../../db/models/public/appDetails");
const AdminSettings = require("../../db/models/admin/adminSettings");

const {
    dbDebugMsges
} = require("../../config/debug");

/** apps data manipulation */
async function insertApp(data) {
    try {
        const app = new AppDetails(data);
        const doc = await new Promise((resolve, reject) => {
            app.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        dbDebugMsges("Successfully inserted app data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

//if id, update by id
async function upsertAppDetails(data) {
    try {
        const doc = await AppDetails.findOneAndUpdate(
            { app_id: data.app_id },
            data,
            { new: true, upsert: true }
        )
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry", data.email);
            return null;
        }
        dbDebugMsges("Successfully upserted an app details", data.app_id, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateAppById(data) {
    try {
        const doc = await AppDetails.findOneAndUpdate(
            { app_id: data.app_id },
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such app data found");
            return null;
        }
        dbDebugMsges("Successfully updated app data", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function removeAppDetailById(app_id) {
    try {
        await AppDetails.deleteOne({ app_id: app_id });
        dbDebugMsges("Successfully removed the following app details", app_id);
        return true;
    } catch (err) {
        dbDebugMsges(err);
        return false;
    }
}

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

/** admin settings */

async function insertAdminSettings(data) {
    try {
        const adminSettings = new AdminSettings(data);
        const doc = await new Promise((resolve, reject) => {
            adminSettings.save(function (err, doc) {
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

async function updateAdminSettings(data) {
    try {
        const doc = await AdminSettings.findOneAndUpdate(
            {},
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such admin settings found");
            return null;
        }
        dbDebugMsges("Successfully updated admin settings", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getAdminSettings() {
    try {
        const doc = await AdminSettings.findOne();
        if (!doc) {
            dbDebugMsges("No such admin settings found");
            return null;
        }
        dbDebugMsges("Successfully found admin settings", doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    insertApp,
    upsertAppDetails,
    removeAppDetailById,
    updateAppById,

    insertAboutMe,
    updateAboutMe,
    
    insertAdminSettings,
    updateAdminSettings,
    getAdminSettings
}