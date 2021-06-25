const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JordanHoSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    crossfire_profile_url: {
        type: String,
        required: true
    },
    youtube_url: {
        type: String,
        required: true
    },
    linkedin_url: {
        type: String,
        required: true
    },
    github_url: {
        type: String,
        required: true
    },
    twitch_url: {
        type: String,
        required: true
    },
    steam_url: {
        type: String,
        required: true
    },
    esea_url: {
        type: String,
        required: true
    },
    website_frontend_github_url: {
        type: String,
        required: true
    },
    website_backend_github_url: {
        type: String,
        required: true
    },
    resume_file_id: {
        type: String,
    },
    profile_picture_file_id: {
        type: String,
    }
},
{
        capped: true,
        size: 9999,
        max: 1//only 1 document for this collection 
}
);

module.exports = mongoose.model('jordan_ho', JordanHoSchema, "jordan_ho_data");