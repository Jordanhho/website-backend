const moment = require("moment");

const UserModel = require("../../db/models/auth/user");
const TempUserModel = require("../../db/models/auth/tempUser");
const ResetPassUserModel = require("../../db/models/auth/resetPassUser");

const {
    compareHashedPassword
} = require("../../config/hashing");

const {
    dbDebugMsges
} = require("../../config/debug");

/** User Model **/

async function getUserByEmail(email) {
    try {
        const doc = await UserModel.findOne({ email: email });
        if(!doc) {
            dbDebugMsges("No such user found", email);
            return null;
        }
        dbDebugMsges("Successfully found user", email, doc);
        return doc.toObject();
    } catch(err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getUserByUserId(userid) {
    try {
        const doc = await UserModel.findOne({ userid: userid });
        if (!doc) {
            dbDebugMsges("No such user found", userid);
            return null;
        }
        dbDebugMsges("Successfully found user", doc.email, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getUserByEmailAndPassword(email, password) {
    try {
        const doc = await UserModel.findOne({ email: email });
        if (!doc) {
            dbDebugMsges("No such user found", email);
            return null;
        }

        const correctPassword = await compareHashedPassword(password, doc.password);

        if (!correctPassword) {
            dbDebugMsges("Error password does not match", { email, password }, doc);
            return null;
        }
        dbDebugMsges("Successfully found user with matching password", { email, password }, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function insertUser(data) {
    try {
        const user = new UserModel(data);
        const doc = await new Promise((resolve, reject) => {
            user.save(function (err, doc) {
                if (err) {
                    dbDebugMsges(err);
                    reject(null);
                }
                resolve(doc);
            });
        });
        if (!doc) {
            dbDebugMsges("Insertion failed, there is an existing user", user);
            return null;
        }
        dbDebugMsges("Successfully inserted a user", user, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function updateUserByEmail(data) {
    try {
        const doc = await UserModel.findOneAndUpdate(
            { email: data.email },
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such user found to update", data.email);
            return null;
        }
        dbDebugMsges("Successfully updated user", data.email, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}



/** Temp New User Model **/

async function getTempUserByEmail(email) {
    try {
        const doc = await TempUserModel.findOne({ email: email });
        if (!doc) {
            dbDebugMsges("No such temp user found", email);
            return null;
        }
        dbDebugMsges("Successfully found temp user", email, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function getTempUserByActivationCodeAndEmail(email, activation_code) {
    try {
        const doc = await TempUserModel.findOne({ email: email, activation_code: activation_code });
        if (!doc) {
            dbDebugMsges("No such temp user found", email);
            return null;
        }
        dbDebugMsges("Successfully found temp user", email, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function upsertTempUser(data) {
    try {
        const doc = await TempUserModel.findOneAndUpdate(
            { email: data.email },
            data,
            { new: true, upsert: true }
        )
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry", data.email);
            return null;
        }
        dbDebugMsges("Successfully upserted a temp user", data.email, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function removeTempUserByEmail(email) {
    try {
        await TempUserModel.deleteOne({ email: email });
        dbDebugMsges("Successfully removed the following temp user", email);
        return true;
    } catch (err) {
        dbDebugMsges(err);
        return false;
    }
}

async function clearExpiredTempUsers() {
    let deletedTempUsers = [];
    try {
        await TempUserModel.find((err, docs) => {
            docs.forEach(async (doc) => {
                //loop through all docs and call delete on every temp user whose expiry time is past.
                if (moment().isAfter(moment(doc.verification_code_expire_at))) {
                    const deletedTempUser = await removeTempUserByEmail(doc.email);
                    if (!deletedTempUser) {
                        dbDebugMsges(err);
                    }
                    else {
                        deletedTempUsers.push(doc.email);
                    }
                }
            });
        });
        if (deletedTempUsers.length > 0) {
            dbDebugMsges("Removed the following temp users that have expired. ", null, deletedTempUsers);
        }
    } catch (err) {
        dbDebugMsges(err);
    }
}



/** Reset Pass User Model **/

async function getResetPassUserByVerificationCodeAndEmail(email, verification_code) {
    try {
        const doc = await ResetPassUserModel.findOne({ email: email, verification_code: verification_code });
        if (!doc) {
            dbDebugMsges("No such reset pass user found", email);
            return null;
        }
        dbDebugMsges("Successfully found reset pass user", { email, verification_code }, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}


async function getResetPassUserByVerificationTokenAndEmail(email, verification_token) {
    try {
        const doc = await ResetPassUserModel.findOne({ email: email, verification_token: verification_token });
        if (!doc) {
            dbDebugMsges("No such reset pass user found", email);
            return null;
        }
        dbDebugMsges("Successfully found reset pass user", { email, verification_token }, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}


async function upsertResetPassUser(data) {
    try {
        const doc = await ResetPassUserModel.findOneAndUpdate(
            { email: data.email },
            data,
            { new: true, upsert: true }
        )
        if (!doc) {
            dbDebugMsges("No upsert executed, there already exists an identical entry", data.email);
            return null;
        }
        dbDebugMsges("Successfully upserted a reset pass user", data.email, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}


async function updateResetPassUserByEmail(data) {
    try {
        const doc = await ResetPassUserModel.findOneAndUpdate(
            { email: data.email },
            data,
            { new: true }
        );
        if (!doc) {
            dbDebugMsges("No such reset pass user found to update", data.email);
            return null;
        }
        dbDebugMsges("Successfully updated reset pass user", data, doc);
        return doc.toObject();
    } catch (err) {
        dbDebugMsges(err);
        return null;
    }
}

async function removeResetPassUserByEmail(email) {
    try {
        await ResetPassUserModel.deleteOne({ email: email });
        dbDebugMsges("Successfully removed the following reset pass user", email);
        return true;
    } catch (err) {
        dbDebugMsges(err);
        return false;
    }
}

async function clearExpiredResetPassUsers() {
    let deletedResetUsers = [];
    try {
        await ResetPassUserModel.find((err, docs) => {
            docs.forEach(async (doc) => {
                //loop through all docs and call delete on every reset pass user whose expiry time is past.
                if (moment().isAfter(moment(doc.verification_code_expire_at))) {
                    const deletedResetPassUser = await removeResetPassUserByEmail(doc.email);
                    if (!deletedResetPassUser) {
                        dbDebugMsges(err);
                    }
                    else {
                        deletedResetUsers.push(doc.email);
                    }
                }
            });
        });
        if (deletedResetUsers.length > 0) {
            dbDebugMsges("Removed the following reset pass users that have expired. ", null, deletedResetUsers);
        }
    } catch (err) {
        dbDebugMsges(err);
    }
}

module.exports = {
    getUserByUserId,
    getUserByEmail,
    getUserByEmailAndPassword,
    insertUser,
    updateUserByEmail,

    getTempUserByEmail,
    getTempUserByActivationCodeAndEmail,
    upsertTempUser,
    removeTempUserByEmail,
    clearExpiredTempUsers,

    getResetPassUserByVerificationCodeAndEmail,
    getResetPassUserByVerificationTokenAndEmail,
    upsertResetPassUser,
    updateResetPassUserByEmail,
    removeResetPassUserByEmail,
    clearExpiredResetPassUsers
}