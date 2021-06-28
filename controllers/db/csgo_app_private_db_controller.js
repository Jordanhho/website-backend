const MapDetails = require("../../db/models/csgo/mapDetails");
const UtilDetails = require("../../db/models/csgo/utilDetails");

const {
    dbDebugMsges
} = require("../../config/debug");

const {
    getNormalObjFromDoc
} = require("./db_utility");

async function insertMap(data, safe = true) {
    try {
        const mapDetails = new MapDetails(data);
        const savedDocDbObj = await new Promise((resolve, reject) => {
            mapDetails.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        //get normal object for insert
        const doc = await MapDetails.findOne({ _id: savedDocDbObj._id }).lean();
        if (!doc) {
            dbDebugMsges("Insertion failed, there is an existing object: ", mapDetails);
            return null;
        }
        dbDebugMsges("Successfully inserted map.");
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function upsertMap(data, safe = true) {
    try {
        const doc = await MapDetails.findOneAndUpdate(
            {map_id: data.map_id},
            data,
            { new: true, upsert: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry");
            return null;
        }
        dbDebugMsges("Successfully upserted Map data");
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}



async function upsertUtil(data, safe = true) {
    try {
        const doc = await UtilDetails.findOneAndUpdate(
            { util_id: data.util_id },
            data,
            { new: true, upsert: true }
        ).lean();
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry");
            return null;
        }
        dbDebugMsges("Successfully upserted util data");
        return getNormalObjFromDoc(doc, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
   insertMap,
   upsertMap,
   upsertUtil
}