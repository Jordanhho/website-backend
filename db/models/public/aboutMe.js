const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BucketFile = require("../aws/bucketFile");

const AboutMeSchema = new Schema({
    profile_picture_file_id: {
        type: String
    },
    personality_and_passion: {
        type: String
    },
    esports_description: {
        type: String
    },
    goal_description: {
        type: String
    },
    details_about_self: {
        type: [String]
    },
    interested_in: {
        type: [String]
    },
}, 
{ 
    capped: true,
    size: 9999,
    max: 1//only 1 document for this collection 
});
module.exports = mongoose.model('about_me', AboutMeSchema, "about_me_data");