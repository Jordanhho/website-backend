const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BucketFile = require("../aws/bucketFile");

const AboutMeSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    profile_picture: {
        type: BucketFile
    },
    email: {
        type: String,
        required: true
    },
    education_description: {
        type: String,
    },
    experience_description: {
        type: String,
    },
    specialization_description: {
        type: String,
    },
    hobby_description: {
        type: String,
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
    resume: {
        type: BucketFile
    },
}, 
{ 
    capped: true,
    size: 9999,
    max: 1//only 1 document for this collection 
});
module.exports = mongoose.model('about_me', AboutMeSchema, "about_me_data");