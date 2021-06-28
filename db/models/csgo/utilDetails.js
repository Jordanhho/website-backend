const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utilDetailsSchema = new Schema({
    util_id: {
        type: String,
        required: true,
        dropDups: true
    },
    util_img_file_id_list: {
        type: [String]
    },
    map_id: {
        type: String
    },
    init_coord_x: {
        type: Number
    },
    init_coord_y: {
        type: Number
    },
    target_coord_x: {
        type: Number
    },
    target_coord_y: {
        type: Number
    },
    util_type: {
        type: String,
        required: true,
        enum: ['smoke', 'flash', 'grenade', 'molotov'],
    },
    is_private: {
        type: Boolean
    },
    util_name: {
        type: String
    },
    util_description: {
        type: String
    },
    is_64_tick: {
        type: Boolean
    },
    is_128_tick: {
        type: Boolean
    }
});

module.exports = mongoose.model('util_details', utilDetailsSchema, "util_details_data");


