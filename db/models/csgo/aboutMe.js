const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AboutMeSchema = new Schema({
    description: { type: String },
    email: { type: String },
    linkedin: { type: String },
    github: { type: String },
    resume: { type: String }
});

module.exports = mongoose.model('AboutMe', AboutMeSchema, "about_me");