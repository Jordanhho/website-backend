const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppDetailsSchema = new Schema({
    app_id: {
        type: String,
        unique: true,
        required: true,
        dropDups: true
    },
    app_name: {
        type: String
    },
    app_description: {
        type: String
    },
    github_url: {
        type: String
    },
    app_type: {
        type: String
    },
    app_url: {
        type: String
    },
    is_wip: {
        type: Boolean
    },
    is_github_private: {
        type: Boolean
    }
});

module.exports = mongoose.model('app_datails', AppDetailsSchema, "app_details_data");