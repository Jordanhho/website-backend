const UserModel = require("../models/User");
const TempUserModel = require("../models/tempUser");
const ResetPassUserModel = require("../models/resetPassUser");

const BaseMapModel = require("../models/BaseMap");
const UtilityModel = require("../models/Utility");
const AboutMeModel = require("../models/AboutMe");
const ms = require("ms");

const {
    compareHashedPassword
} = require("../config/hashing");

const moment = require("moment");


function getEmailExpiryTime() {
    // expiry time of email verification = current time + 1 day
    //store as ISO 8601
    let expiryTime = moment().add(ms(process.env.EMAIL_VERIFICATION_EXPIRE), 'ms').toISOString();
    return expiryTime;
}

function getResetPasswordExpiryTime() {
    // expiry time of email password reset = current time + 1 day
    //store as ISO 8601
    let expiryTime = moment().add(ms(process.env.RESET_PASSWORD_EXPIRE), 'ms').toISOString();
    return expiryTime;
}

async function getUserByEmail(email) {
    return new Promise(resolve => {
        console.log("looking for email: ", email);
        UserModel.findOne({ email: { "$eq": email } }, function (err, doc) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            //no matches
            else if (!doc) {
                console.log("No such user found");
                resolve(null);
            }
            else {
                console.log("Query Result : ", doc);
                resolve(doc);
            }
        });
    });
}

async function getTempUserByEmail(email) {
    return new Promise(resolve => {
        console.log("looking for email: ", email);
        TempUserModel.findOne({ email: { "$eq": email } }, function (err, doc) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            //no matches
            else if (!doc) {
                console.log("No such temp user found");
                resolve(null);
            }
            else {
                console.log("Query Result : ", doc);
                resolve(doc);
            }
        });
    });
}

async function getCleanUserByUserId(userid) {
    return new Promise(resolve => {
        console.log("Looking for userid: ", userid);
        UserModel.findOne({ userid: { "$eq": userid } }, function (err, doc) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            //no matches
            else if (!doc) {
                console.log("No such user found");
                resolve(null);
            }
            else {

                //create a clean version of userdbobj that does not have any sensitive information
                //only email, first name, lastname, userid
                const cleanUserObj = {
                    email: doc.email,
                    firstname: doc.firstname,
                    lastname: doc.lastname,
                    userid: doc.userid,
                }

                console.log("Clean user : ", cleanUserObj);
                resolve(cleanUserObj);
            }
        });
    });
}
async function getCleanUserByEmailPassword(email, password) {
    return new Promise(resolve => {
        console.log("Looking for email+password user: ", email, password);
        UserModel.findOne({ email: { "$eq": email } }, function (err, doc) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            //no matches
            else if (!doc) {
                console.log("No such user found");
                resolve(null);
            }
            else {
                //if password does not match, then return error
                console.log(doc);
                if (!compareHashedPassword(password, doc.password)) {
                    console.log("Error password does not match");
                    resolve(null);
                }

                //create a clean version of userdbobj that does not have any sensitive information
                //only email, first name, lastname, userid
                const cleanUserObj = {
                    email: doc.email,
                    firstname: doc.firstname,
                    lastname: doc.lastname,
                    userid: doc.userid,
                }

                console.log("Clean user : ", cleanUserObj);
                resolve(cleanUserObj);
            }
        });
    });
}

async function insertNewTempUser(userObj) {
    return new Promise(resolve => {
        const newTempUser = new TempUserModel({
            email: userObj.email,
            password: userObj.password,
            firstname: userObj.firstname,
            lastname: userObj.lastname,
            verify_email_expire_at: getEmailExpiryTime(),
        });
        newTempUser.save(function (err, docs) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            else {
                console.log("Insert Result : ", docs);
                resolve(docs);
            }
        });
    });
}


async function insertUser(userObj) {
    return new Promise(resolve => {
        console.log("Inserting new user: ", userObj);
        const user = new UserModel({
            email: userObj.email,
            password: userObj.password,
            firstname: userObj.firstname,
            lastname: userObj.lastname
        });
        user.save(function (err, docs) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            else {
                console.log("Insert Result : ", docs);
                resolve(docs);
            }
        });
    });
}


async function upsertResetPassUser(userid) {
    return new Promise(resolve => {
        console.log("Inserting user: ", userid);
        ResetPassUserModel.findOneAndUpdate({ userid: { "$eq": userid } },
            {
                userid: userid,
                reset_password_expire_at: getResetPasswordExpiryTime(),
            },
            { upsert: true, setDefaultsOnInsert: true, new: true},
            (err, doc) => {
                if (err) {
                    console.log(err);
                    resolve(null);
                }
                else {
                    console.log("Insert Result : ", doc);
                    resolve(doc);
                }
            }
        )
    });
}




function getValidResetPassUserByPassHash(resetPassHash) {
    return new Promise(resolve => {
        console.log("Looking for reset pass hash: ", resetPassHash);
        ResetPassUserModel.findOne({ reset_password_hash: { "$eq": resetPassHash } }, (err, doc) => {
            if (err) {
                console.log(err);
                resolve(null);
            }
            //found nothing
            else if (!doc) {
                console.log("No such reset pass user is associated with reset pass hash")
                resolve(null);
            }
            // successfully matches
            else {
                console.log("found reset user: ", doc);
                //check if reset_password_expire_at is past now, if so, it is invalid, do nothing.
                const reset_password_expire_at = doc.reset_password_expire_at;

                //expired
                if (moment().isAfter(moment(reset_password_expire_at))) {
                    console.log("Expired reset password link");
                    resolve(null);
                }
                else {
                    console.log("Found matching reset pass user and not expired.");
                    resolve(doc);
                }
            }
        });
    });
}


// /*
//     upon send email, create an entry in resetpass user table with a hash,
//     This function will check if the hash exists and has not expired.
//     if so:
//     - update the changed password
//     - remove the entry in the reset pass user table.
// */
// function verifyResetPasswordHash(resetPassHash) {
//     return new Promise(resolve => {
//         console.log("Looking for reset pass hash: ", resetPassHash);
//         ResetPassUserModel.findOne({ reset_password_hash: { "$eq": resetPassHash } }, (err, doc) => {
//             if (err) {
//                 console.log(err);
//                 resolve(false);
//             }
//             //found nothing
//             else if (!doc) {
//                 console.log("No such reset pass user is associated with reset pass hash")
//                 resolve(false);
//             }
//             // successfully matches
//             else {
//                 console.log("found reset user: ", doc);
//                 //check if reset_password_expire_at is past now, if so, it is invalid, do nothing.
//                 const reset_password_expire_at = doc.reset_password_expire_at;

//                 //expired
//                 if (moment().isAfter(moment(reset_password_expire_at))) {
//                     console.log("Expired reset password link");
//                     resolve(false);
//                 }
//                 else {
//                     console.log("Found matching reset pass user and not expired.");
//                     resolve(true);
//                 }
//             }
//         });
//     });
// }







function updateUserByUserid(userObj) {
    console.log("updating user: ", userObj);
    return new Promise(resolve => {
        UserModel.findOneAndUpdate(
            { userid: { "$eq": userObj.userid } }, 
            userObj, 
            { runValidators: true }, //to trigger .save methods
            function (err, docs) {
            if (err) {
                console.log(err);
                resolve(null);
            }
            else {
                console.log("Updated Result : ", docs);
                resolve(docs);
            }
        });
    });
}



/*
    Check if there exists a temp user with the email verification hash
    if true:
    - copy email, password, firstname, lastname and create a new user
    - delete the temp user
    if false:
    - do nothing.
*/
function verifyUserByEmailVerificationHash(emailVerificationHash) {
    return new Promise(resolve => {
        console.log("Looking for email hash: ", emailVerificationHash);
        TempUserModel.findOne({ verify_email_hash: { "$eq": emailVerificationHash } }, (err, doc) => {
            if (err) {
                console.log(err);
                resolve(false);
            }
            //found nothing
            else if (!doc) {
                console.log("No such temp user is associated with email verification hash")
                resolve(false);
            }
            // successfully matches
            else {
                console.log("found temp user: ", doc);
                //check if verify_email_expire_at is past now, if so, it is invalid, do nothing.
                const verify_email_expire_at = doc.verify_email_expire_at;

                //expired
                if (moment().isAfter(moment(verify_email_expire_at))) {
                    console.log("Expired email verification");
                    resolve(false);
                }
                else {
                    console.log("Found matching temp user and not expired.");

                    //insert new user
                    insertUser(doc);

                    //delete temp user
                    TempUserModel.deleteOne({ _id: doc._id }, function (err) {
                        if (err) {
                            console.log(err);
                            resolve(false);
                        }
                        else {
                            console.log("Removed Temp User");
                            resolve(true);
                        }
                    });
                }
            }
        });
    });
}

async function clearExpiredEmailVerificationUsers() {
    let deletedTempUsers = [];
    await TempUserModel.find((err, docs) => {
        docs.forEach(doc => {
            //loop through all docs and call delete on every temp user whose expiry time is past.
            if (moment().isAfter(moment(doc.verify_email_expire_at))) {
                TempUserModel.deleteOne({ _id: { "$eq": doc._id } }, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        deletedTempUsers.push(doc.email);
                    }
                });
            }
        });
    });

    console.log("Deleted the following expired temp users:");
    console.log(deletedTempUsers);
}


async function clearExpiredResetPasswordUsers() {
    let deletedResetUsers = [];
    await ResetPassUserModel.find((err, docs) => {
        docs.forEach(doc => {
            //loop through all docs and call delete on every temp user whose expiry time is past.
            if (moment().isAfter(moment(doc.reset_password_expire_at))) {
                let result =  removeResetPassUserById(doc.userid);
                if(result) {
                    deletedResetUsers.push(doc.userid);
                }
            }
        });
    });

    console.log("Deleted the following expired reset users:");
    console.log(deletedResetUsers);
}


async function removeResetPassUserById(userid) {
    return new Promise(resolve => {
        console.log("attempting to delete: ", userid);
        //delete reset pass user
        ResetPassUserModel.deleteOne({ userid: { "$eq": userid } }, function (err) {
            if (err) {
                console.log(err);
                resolve(false);
            }
            else {
                console.log("Removed Reset Password User");
                resolve(true);
            }
        });
    });
}






module.exports = {
    getUserByEmail,
    getTempUserByEmail,
    getCleanUserByUserId,
    getCleanUserByEmailPassword,
    insertNewTempUser,
    insertUser,
    verifyUserByEmailVerificationHash,

    clearExpiredEmailVerificationUsers,
    updateUserByUserid,
    clearExpiredResetPasswordUsers,
    getValidResetPassUserByPassHash,
    removeResetPassUserById,
    upsertResetPassUser


    
    // deleteTempUser: async function(emailVerificationHash) {
    //     await TempUserModel.findOneAndDelete({ verify_email_hash: { "$eq": emailVerificationHash }}, (err, doc) => {
            
    //     });
    // }








    // getAboutMe: function () {
    //     return new Promise(resolve => {
    //         AboutMeModel.find({}, function (err, doc) {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query Result : ", doc);
    //                 resolve(doc);
    //             }
    //         });
    //     });
    // },

    // updateAboutMe: function(data) {

    //     //TODO need to sanitize html from description
    //     let doc = getAboutMe();

    //     doc = data;

    //     doc.save((err, updatedDoc) => {
    //         if (err) {
    //             console.log(err);
    //             resolve(null);
    //         }
    //         else {
    //             resolve(updatedDoc);
    //         }
    //     });
    // },






    // getUserByUserName: function (username) {
    //     return new Promise(resolve => {
    //         UserModel.findOne({ username: { "$eq": username } }, function (err, docs) {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query Result : ", docs);
    //                 resolve(docs);
    //             }
    //         }); 
    //     });
    // },


    // getBaseMaps: function() {
    //     return new Promise(resolve => {
    //         BaseMapModel.find({}, function(err, docs) {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query Result : ", docs);
    //                 resolve(docs);
    //             }
    //         });
    //     });//
    // },

    // getBaseMapByMapId: function(mapId) {
    //     return new Promise(resolve => {
    //         BaseMapModel.findOne({ mapId: { "$eq": mapId } }, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else if (!docs) {
    //                 console.log("no such docs found");
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query result: ", docs);
    //                 resolve(docs);
    //             }
    //         });
    //     });
    // },


    // updateBaseMap: function(baseMapObj) {
    //     return new Promise(resolve => {
    //         const awsS3ItemId = baseMapObj.awsS3ItemId;
    //         const mapId = baseMapObj.mapId;
    //         const dateUploaded = new Date();

    //         console.log('date uploaded', dateUploaded);

    //         BaseMapModel.findOne({ mapId: { "$eq": mapId } }, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else if (!docs) {
    //                 console.log("no such docs found");
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query Result : ", docs);

    //                 //update the awsS3ItemId =  and uploadedDate
    //                 docs.awsS3ItemId = awsS3ItemId;
    //                 docs.dateUploaded = dateUploaded;

    //                 docs.save((err, updatedDoc) => {
    //                     if(err) {
    //                         console.log(err);
    //                         resolve(null);
    //                     }   
    //                     else {
    //                         resolve(updatedDoc);
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // },

    // getUtilDataByUtilId: function(utilId) {
    //     return new Promise(resolve => {
    //         UtilityModel.findOne({ utilId: { "$eq": utilId } }, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else if (!docs) {
    //                 console.log("no such docs found");
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query result: ", docs);

    //                 //modify the results and only return a list of utility objects that contain only the utilId, 

    //                 resolve(docs);
    //             }
    //         });
    //     });
    // },


    // getAllUtilityDataByMapId: function (mapId) {
    //     return new Promise(resolve => {
    //         UtilityModel.find({ mapId: { "$eq": mapId } }, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else if (!docs) {
    //                 console.log("no such docs found");
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query result: ", docs);

    //                 //modify the results and only return a list of utility objects that contain only the utilId, initPosCoord, targetPosCoord, isCTSide, isTSide, utilType
    //                 let data = {
    //                     utilId: docs.utilId,
    //                     isCTSide: docs.isCTSide,
    //                     isTSide: docs.isTSide,
    //                     utilType: docs.utilType,
    //                     initPosCoord: docs.initPosCoord,
    //                     targetPosCoord: docs.targetPosCoord
    //                 };

    //                 resolve(data);
    //             }
    //         });
    //     });
    // },


    // updateUtilityDataByUtilId: function (updateDataObj, utilId) {
    //     return new Promise(resolve => {
    //         UtilityModel.findOne({ utilId: { "$eq": utilId } }, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else if (!docs) {
    //                 console.log("no such docs found");
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Query Result : ", docs);

    //                 for (var key in updateDataObj) {
    //                     if (docs.hasOwnProperty(key)) {
    //                         docs[key] = updateDataObj[key];
    //                     }
    //                 }

    //                 docs.save((err, updatedDoc) => {
    //                     if (err) {
    //                         console.log(err);
    //                         resolve(null);
    //                     }
    //                     else {
    //                         resolve(updatedDoc);
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // },


    // addUtilityData: function(dataObj, username) {
    //     return new Promise(resolve => {

    //         //generate a new uuid for utilId
    //         let utilId = uuidv4();

    //             //TOdo THIS IS INCORRECT NEED FOR MULTI IMAGE HANDLING

    //         let newUtilObj = new UtilityModel({
    //             utilId: utilId,
    //             lastUpdated: dataObj.lastUpdated,
    //             uploadedBy: dataObj.username,
    //             imgName: dataObj.imgName,
    //             imgInstruction: dataObj.imgInstruction,
    //             imgList: dataObj.imgList,
    //             mapId: dataObj.mapId,
    //             is128Tick: dataObj.is128Tick,
    //             is64Tick: dataObj.is64Tick,
    //             jumpThrow: dataObj.jumpThrow,
    //             runThrow: dataObj.runThrow,
    //             standThrow: dataObj.standThrow,
    //             isCTSide: dataObj.isCTSide,
    //             isTSide: dataObj.isTSide,
    //             utilType: dataObj.utilType,
    //             initPosCoord: dataObj.initPosCoord,
    //             targetPosCoord: dataObj.targetPosCoord
    //         });

    //         newUtilObj.save(function (err, docs) {
    //             if(err) {
    //                 console.log(err);
    //                 resolve(null);
    //             }
    //             else {
    //                 console.log("Successfully added");
    //                 resolve(docs);
    //             }
    //         });
    //     });
    // },

    // removeUtilityDataByUtilId: function(utilId) {
    //     return new Promise(resolve => {
    //         UtilityModel.findOneAndDelete({ utilId: { "$eq": utilId } }, (err, docs) => {
    //             if (err) {
    //                 console.log(err);
    //                 resolve(false);
    //             }
    //             else {
    //                 console.log("successfully deleleted util Id: ", utilId);
    //                 resolve(true);
    //             }
    //         });
    //     });
    // },



    







}