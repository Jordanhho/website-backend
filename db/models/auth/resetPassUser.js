const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResetPassUserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    verification_code: {
        type: String,
        required: true
    },
    verification_code_expire_at: {
        type: String, //stored as ISO 8601
        required: true
    },
    verification_token: {
        type: String,
    },
    verification_token_expire_at: {
        type: String, //stored as ISO 8601
    }
});

module.exports = mongoose.model('reset_pass_user', ResetPassUserSchema, "reset_pass_user_data");