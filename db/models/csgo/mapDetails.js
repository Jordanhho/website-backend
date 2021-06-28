const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MapDetailsSchema = new Schema({
    cloudfront_map_url: {
        type: String
    },
    map_name: {
        enum: ['Dust 2', 'Mirage', 'Nuke', 'Inferno', 'Train', 'Vertigo', 'Overpass', "Ancient"],
        type: String
    },
    map_id: {
        enum: ['de_dust2', 'de_mirage', 'de_nuke', 'de_inferno', 'de_train', 'de_vertigo', 'de_overpass', 'de_ancient'],
        type: String
    },
});

module.exports = mongoose.model('map_details', MapDetailsSchema, "map_details_data");