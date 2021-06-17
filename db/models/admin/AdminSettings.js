const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//table for storing aws bucket key, link and expiry of link
const AdminSettingsSchema = new Schema({
    enable_new_accounts: {
        type: Boolean
    },
    enable_emailing: {
        type: Boolean
    },
    enable_change_password: {
        type: Boolean
    }
},
{
    capped: true,
    size: 9999,
    max: 1//only 1 document for this collection 
});
module.exports = mongoose.model('admin_settings', AdminSettingsSchema, "admin_settings_data");