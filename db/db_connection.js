const mongoose = require('mongoose');
const express = require('express');

const DB_CLEAR_EXPIRED_ITEMS = process.env.DB_CLEAR_EXPIRED_ITEMS;

const {
    clearExpiredTempUsers,
    clearExpiredResetPassUsers
} = require("../controllers/db/auth_db_controller");

const {
    initLocalAdminSettings
} = require("../config/admin_settings");

//database credentials
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

//database connection
const mongoDbUrl = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.6hlv5.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(mongoDbUrl, { useUnifiedTopology: true });
const dbConnection = mongoose.connection;

function connectToDb() {
    return new Promise((resolve, reject) => {
        console.log("Attemping to connect to database.")

        //time out of 20 seconds if db isnt connected by then.
        dbTimeout = setTimeout(function () {
            dbConnection.close()
            console.log("Closed database.")
            reject("Database cannot be be reached. Check your network settings.")
        }, 10000);

        dbConnection.once('open', async _ => {
            //successfully connected, clear the timeout
            clearTimeout(dbTimeout);

            //On startup server remove expired items
            if (DB_CLEAR_EXPIRED_ITEMS === "true") {
                clearExpiredTempUsers();
                clearExpiredResetPassUsers();
            }

            //on startup setup admin settings
            await initLocalAdminSettings();
            resolve(mongoDbUrl);
        });

        //error on db connection
        dbConnection.on('error', err => {
            reject(err);
        });
    })
}

module.exports = {
    mongoDbUrl,
    dbConnection,
    connectToDb
};