const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EducationDetailsSchema = new Schema({
    education_name: {
        type: String
    },
    school_name: {
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
    education_description: {
        type: String
    }
});

module.exports = EducationDetailsSchema;