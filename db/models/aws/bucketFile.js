const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//table for storing aws bucket key, link and expiry of link
const BucketFileSchema = new Schema({
    url: {
        type: String
    },
    expire_at: {
        type: String
    },
    bucket_key: {
        type: String
    },
    github_url: {
        type: String
    }
});

module.exports = BucketFileSchema;