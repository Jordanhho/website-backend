const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorkExperienceSchema = new Schema({
    company_name: {
        type: String
    },
    position_name: {
        type: String
    },
    date_start: {
        type: String
    },
    date_end: {
        type: String
    },
    location: {
        type: String
    },
    experience_description: {
        type: String
    },
    website_url: {
        type: String
    },
    technologies: [String]
});

module.exports = WorkExperienceSchema;