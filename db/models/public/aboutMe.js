const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AboutMeSchema = new Schema({
    _id: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    linkedin_url: {
        type: String, 
        required: true
    },
    github_url: {
        type: String, 
        required: true
    },
    resume_url: {
        type: String,
        required: true
    },
});
module.exports = mongoose.model('about_me', AboutMeSchema, "about_me_data");