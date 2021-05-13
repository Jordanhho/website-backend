const path = require('path');

//note requires path ie: .config({ path: "/fullpath/"})
require('dotenv').config({
    path: path.resolve('./config/.env'),
});

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//to sanitize all input
const mongoSanitize = require('express-mongo-sanitize');

const express = require("express");
const port = process.env.PORT || 8080;
const app = express();

// enable CORS
app.use(cors({
    origin: "http://localhost:3000", // url of the frontend application
    credentials: true // set credentials true for secure httpOnly cookie
}));
// use cookie parser for secure httpOnly cookie
app.use(cookieParser(process.env.COOKIE_SECRET));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));
// parse application/json
app.use(bodyParser.json());

// To remove malious data for mongoose:
app.use(mongoSanitize());

//establish database connection
const dbConnection = require("./config/db_connection");

//all routes for api
const authRoutes = require("./routes/auth_routes");

//routes for csrf and jwt tokens
app.use(authRoutes);

app.listen(port, () => {
    console.log(`Listening to ${port}`)
});