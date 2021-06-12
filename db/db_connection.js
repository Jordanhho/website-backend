const mongoose = require('mongoose');

const DB_CLEAR_EXPIRED_ITEMS = process.env.DB_CLEAR_EXPIRED_ITEMS;

const {
    clearExpiredTempUsers,
    clearExpiredResetPassUsers
} = require("../controllers/db/auth_db_controller");

//to fix issues with mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//database credentials
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

//database connection
const dbUrl = 'mongodb+srv://' + DB_USERNAME + ':' + DB_PASSWORD + '@cluster0.6hlv5.mongodb.net/' + DB_NAME + '?retryWrites=true&w=majority';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const dbConnection = mongoose.connection;
dbConnection.once('open', _ => {
    console.log('Database connected:', dbUrl)
    
    //On startup server remove expired items
    if (DB_CLEAR_EXPIRED_ITEMS === "true") {
        clearExpiredTempUsers();
        clearExpiredResetPassUsers();
    }
});
dbConnection.on('error', err => {
    console.error('Connection error:', err)
});

module.exports = dbConnection;