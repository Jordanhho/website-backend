const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EducationDetails = require("../sub_models/EducationDetails");
const SchoolExperience = require("../sub_models/SchoolExperience");
const WorkExperience = require("../sub_models/WorkExperience");

const ResumeDisplaySchema = new Schema(
    {
        resume_file_id: {
            type: String
        },
        education: {
            type: [EducationDetails]
        },
        school_experience: {
            type: [SchoolExperience]
        },
        programming_languages_comfortable_with: {
            type: [String]
        },
        programming_languages_experienced_with: {
            type: [String]
        },
        technologies_comfortable_with: {
            type: [String]
        },
        technologies_experienced_with: {
            type: [String]
        },
        work_experience: {
            type: [WorkExperience]
        },
        year_gap_start: {
            type: String
        },
        year_gap_end: {
            type: String
        },
        year_gap_description: {
            type: String
        }
    },  
    {
        capped: true,
        size: 9999,
        max: 1//only 1 document for this collection 
    }
);
module.exports = mongoose.model('resume_display', ResumeDisplaySchema, "resume_display_data");