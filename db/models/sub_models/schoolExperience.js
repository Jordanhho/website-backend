const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SchoolExperienceSchema = new Schema({
    project_for: {
        type: String
    },
    project_name: {
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
    experience_description: {
        type: String
    },
    technologies: [String]
});

module.exports = SchoolExperienceSchema;