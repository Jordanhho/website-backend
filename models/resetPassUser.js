const { nanoid } = require("nanoid");

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResetPassUserSchema = new Schema({
    _id: {
        type: String,
        default: () => nanoid()
    },
    userid: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    reset_password_hash: {
        type: String,
        required: true,
        default: () => nanoid(128)
    },
    reset_password_expire_at: {
        type: String,
        required: true,
    }
});
module.exports = mongoose.model('reset_pass_user', ResetPassUserSchema, "reset_pass_user_data");