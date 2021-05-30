const path = require('path');

//note requires path ie: .config({ path: "/fullpath/"})
require('dotenv').config({
    path: path.resolve('./config/.env'),
});

//security
const helmet = require("helmet");

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//to sanitize all input
const mongoSanitize = require('express-mongo-sanitize');

const express = require("express");
const port = process.env.EXPRESS_PORT || 8080;
const app = express();

//for security
app.use(helmet());

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
const dbConnection = require("./db/db_connection");

const publicRouter = require("./router/public/public_router");
const authRouter = require("./router/auth/auth_router");
// const privateRouter = require("./router/private/private)router"); //TODO middleware

//public
app.use(publicRouter);

//routes for csrf and jwt tokens
app.use(authRouter);


app.listen(port, () => {
    console.log(`Listening to ${port}`)
});