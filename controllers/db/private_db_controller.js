const AboutMe = require("../../db/models/public/aboutMe");
const AppDetails = require("../../db/models/public/appDetails");
const AdminSettings = require("../../db/models/settings/adminSettings");
const ResumeDisplay = require("../../db/models/public/resumeDisplay");
const JordanHo = require("../../db/models/public/jordanHo");
const BucketFiles = require("../../db/models/private/bucketFiles");

const {
    dbDebugMsges
} = require("../../config/debug");

const {
    getNormalObjFromDoc
} = require("./db_utility");


/** apps data manipulation */
async function insertApp(data, safe = true) {
    try {
        const app = new AppDetails(data);
        const savedDocDbObj = await new Promise((resolve, reject) => {
            app.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });

        const doc = await AppDetails.findOne({ _id: savedDocDbObj._id }).lean();
        if (!doc) {
            dbDebugMsges("Insertion failed, there is an existing object: ", app);
            return null;
        }
        dbDebugMsges("Successfully inserted app data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

//if id, update by id
async function upsertAppDetails(data, safe = true) {
    try {
        const doc = await AppDetails.findOneAndUpdate(
            { app_id: data.app_id },
            data,
            { new: true, upsert: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry", data.email);
            return null;
        }
        dbDebugMsges("Successfully upserted an app details", data.app_id, doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateAppById(data, safe = true) {
    try {
        const doc = await AppDetails.findOneAndUpdate(
            { app_id: data.app_id },
            data,
            { new: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No such app data found");
            return null;
        }
        dbDebugMsges("Successfully updated app data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function removeAppDetailById(app_id, safe = true) {
    try {
        await AppDetails.deleteOne({ app_id: app_id }).lean();
        dbDebugMsges("Successfully removed the following app details", app_id);
        return true;
    } catch (err) {
        dbDebugMsges(err);
        return false;
    }
}

/** about me data manipulation */

async function insertAboutMe(data, safe = true) {
    try {
        const aboutMe = new AboutMe(data);
        const savedDocDbObj = await new Promise((resolve, reject) => {
            aboutMe.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });

        const doc = await AboutMe.findOne({ _id: savedDocDbObj._id }).lean();
        if (!doc) {
            dbDebugMsges("Insertion failed, there is an existing object: ", aboutMe);
            return null;
        }
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateAboutMe(data, safe = true) {
    try {
        const doc = await AboutMe.findOneAndUpdate(
            {},
            data,
            { new: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No such aboutMe data found");
            return null;
        }
        dbDebugMsges("Successfully updated aboutMe data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

/** admin settings */

async function insertAdminSettings(data, safe = true) {
    try {
        const adminSettings = new AdminSettings(data);
        const savedDocDbObj = await new Promise((resolve, reject) => {
            adminSettings.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        //get normal object for insert
        const doc = await AdminSettings.findOne({ _id: savedDocDbObj._id}).lean();
        if (!doc) {
            dbDebugMsges("Insertion failed, there is an existing object: ", adminSettings);
            return null;
        }
        dbDebugMsges("Successfully inserted admin settings.");

        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function upsertBucketFile(data, safe = true) {
    try {
        const doc = await BucketFiles.findOneAndUpdate(
            { file_id: data.file_id },
            data,
            { new: true, upsert: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry");
            return null;
        }
        dbDebugMsges("Successfully upserted a bucket file");
        return getNormalObjFrom(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateBucketFile(data, safe = true) {
    try {
        const doc = await BucketFiles.findOneAndUpdate(
            { file_id: data.file_id },
            data,
            { new: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No such bucket file found");
            return null;
        }
        dbDebugMsges("Successfully updated bucket file", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getBucketFileByFileId(file_id, safe = true) {
    try {
        const doc = await BucketFiles.findOne({ file_id: file_id}).lean();
        if (!doc) {
            dbDebugMsges("No such file found", file_id);
            return null;
        }
        dbDebugMsges("Successfully found file by file_id", file_id, doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}


async function updateAdminSettings(data, safe = true) {
    try {
        const doc = await AdminSettings.findOneAndUpdate(
            {},
            data,
            { new: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No such admin settings found");
            return null;
        }
        dbDebugMsges("Successfully updated admin settings", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getAdminSettings(safe = true) {
    try {
        const doc = await AdminSettings.findOne().lean();
        if (!doc) {
            dbDebugMsges("No such admin settings found");
            return null;
        }
        dbDebugMsges("Successfully found admin settings", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function upsertResumeDisplay(data, safe = true) {
    try {
        const doc = await ResumeDisplay.findOneAndUpdate(
            {},
            data,
            { new: true, upsert: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry");
            return null;
        }
        dbDebugMsges("Successfully upserted an resume display data");
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateResumeDisplay(data, safe = true) {
    try {
        const doc = await ResumeDisplay.findOneAndUpdate(
            {},
            data,
            { new: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No such resume display data found");
            return null;
        }
        dbDebugMsges("Successfully updated resume display data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function upsertJordanHo(data, safe = true) {
    try {
        const doc = await JordanHo.findOneAndUpdate(
            {},
            data,
            { new: true, upsert: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry");
            return null;
        }
        dbDebugMsges("Successfully upserted Jordan Ho data");
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateJordanHo(data, safe = true) {
    try {
        const doc = await JordanHo.findOneAndUpdate(
            {},
            data,
            { new: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No such jordan Ho data found");
            return null;
        }
        dbDebugMsges("Successfully updated Jordan Ho data", doc);
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getJordanHo(safe = true) {
    try {
        const doc = await JordanHo.findOne({}).lean();
        if (!doc) {
            dbDebugMsges("No such Jordan Ho data found");
            return null;
        }
        dbDebugMsges("Successfully found Jordan Ho data", doc);
        return getNormalObjFromDoc(doc, safe);
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

    updateBucketFile,
    upsertBucketFile,
    getBucketFileByFileId,
    
    insertAdminSettings,
    updateAdminSettings,
    getAdminSettings,

    updateResumeDisplay,
    upsertResumeDisplay,

    upsertJordanHo,
    updateJordanHo,
    getJordanHo
}