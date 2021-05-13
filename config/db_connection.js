const mongoose = require('mongoose');

//to fix issues with mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//database credentials
const userName = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

//database connection
const dbUrl = 'mongodb+srv://' + userName + ':' + password + '@cluster0.6hlv5.mongodb.net/' + dbName + '?retryWrites=true&w=majority';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const dbConnection = mongoose.connection;
dbConnection.once('open', _ => {
    console.log('Database connected:', dbUrl)
});
dbConnection.on('error', err => {
    console.error('Connection error:', err)
});

module.exports = dbConnection;