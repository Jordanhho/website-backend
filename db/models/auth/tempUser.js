const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TempUserSchema = new Schema({
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
    activation_code: {
        type: String,
        required: true
    },
    activation_code_expire_at: {
        type: String, //stored as ISO 8601
        required: true
    }
});

module.exports = mongoose.model('temp_user', TempUserSchema, "temp_user_data");