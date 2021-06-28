const MapDetails = require("../../db/models/csgo/mapDetails");
const UtilDetails = require("../../db/models/csgo/utilDetails");

const {
    dbDebugMsges
} = require("../../config/debug");

const {
    getNormalObjFromDoc
} = require("./db_utility");

async function getMaps(safe = true) {
    try {
        const docs = await MapDetails.find().lean();
        if (!docs) {
            dbDebugMsges("No maps found");
            return null;
        }
        dbDebugMsges("Retrived all maps", docs);
        return getNormalObjFromDoc(docs, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getMapDetailByMapId(map_id, safe = true) {
    try {
        const docs = await MapDetails.findOne({ map_id: map_id }).lean();
        if (!docs) {
            dbDebugMsges("No map detail found");
            return null;
        }
        dbDebugMsges("Retrived map detail", docs);
        return getNormalObjFromDoc(docs, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}


async function getUtilDetailByUtilId(util_id, is_private, safe = true) {
    try {
        const docs = await UtilDetails.findOne({ util_id: util_id, is_private: is_private }).lean();
        if (!docs) {
            dbDebugMsges("No util detail found");
            return null;
        }
        dbDebugMsges("Retrived util detail", docs);
        return getNormalObjFromDoc(docs, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getUtilDetailsByMapId(map_id, is_private, safe = true) {
    try {
        const docs = await UtilDetails.find({ map_id: map_id, is_private: is_private }).lean();
        if (!docs) {
            dbDebugMsges("No util details found");
            return null;
        }
        dbDebugMsges("Retrived util details", docs);
        return getNormalObjFromDoc(docs, safe);
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

module.exports = {
    getMaps,
    getMapDetailByMapId,
    getUtilDetailByUtilId,
    getUtilDetailsByMapId
}