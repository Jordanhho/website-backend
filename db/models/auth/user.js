const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PASSWORD_MIN_CHAR = 8;

var UserSchema = new Schema({
    userid: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
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
        minLength: [PASSWORD_MIN_CHAR]
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    level: { 
        type: String, 
        enum: ['ADMIN', 'MEMBER'], 
        default: 'MEMBER',
        required: true
    },
});
module.exports = mongoose.model('user', UserSchema, "user_data");