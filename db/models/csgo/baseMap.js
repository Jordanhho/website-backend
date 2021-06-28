const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

var BaseMapSchema = new Schema({
    awsS3ItemId: {
        type: String,
        required: true
    },
    mapName: {
        type: String,
        enum: ['Dust 2', 'Mirage', 'Nuke', 'Inferno', 'Train', 'Vertigo', 'Overpass'],
        required: true,
        dropDups: true
    },
    dateUploaded: { type: Date, required: true, default: Date.now },
    mapId: {
        type: String,
        enum: ['de_dust2', 'de_mirage', 'de_nuke', 'de_inferno', 'de_train', 'de_vertigo', 'de_overpass'],
        required: true,
        dropDups: true
    },
    uploadedBy: {
        type: String,
        required: true
    }
});

BaseMapSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('BaseMap', BaseMapSchema, "base_map_data");


