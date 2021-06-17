const {
    getAdminSettings
} = require("../controllers/db/private_db_controller")

let local_admin_settings = null;

async function initLocalAdminSettings() {
    return await getAdminSettings();
}

function updateLocalAdminSettings(adminSettings) {
    LOCAL_ADMIN_SETTINGS = adminSettings;
}

module.exports = {
    updateLocalAdminSettings,
    initLocalAdminSettings,
    local_admin_settings
}