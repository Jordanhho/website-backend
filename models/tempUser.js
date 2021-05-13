const { nanoid } = require("nanoid");

const {
    getHashedPassword,
    compareHashedPassword
} = require("../config/hashing");


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempUserSchema = new Schema({
    _id: {
        type: String,
        default: () => nanoid()
    },
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    password: {
        type: String,
        required: true,
        minLength: [8]
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    verify_email_expire_at: {
        type: String, //stored as ISO 8601
        required: false
    },
    verify_email_hash: { 
        type: String, default: () => nanoid(128), //128 character hash
        required: false
    }
});

TempUserSchema.pre("save", function (next) {
    // store reference
    const tempUser = this;

    // only hash the password if it has been modified (or is new)
    if (!tempUser.isModified('password')) {
        throw new Error("Password has not been modified, it is still hashed");
    }
    //password doesnt exist
    else if (!tempUser.password) {
        throw new Error("Password does not exist");
    }
    else {
        const pass = getHashedPassword(tempUser.password);
        tempUser.password = pass;
        next();
    }
});
module.exports = mongoose.model('temp_user', TempUserSchema, "temp_user_data");