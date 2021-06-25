const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BucketFilesSchema = new Schema({
    bucket_file_signed_url: {
        type: String
    },
    cloud_front_url: {
        type: String
    },
    expire_at: {
        type: String
    },
    bucket_key: {
        type: String
    },
    is_private: {
        type: Boolean
    },
    file_id: {
        type: String
    }
});
module.exports = mongoose.model('bucket_files', BucketFilesSchema, "bucket_files_data");