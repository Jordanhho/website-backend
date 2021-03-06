"use strict";

const path = require('path');

//note requires path ie: .config({ path: "/fullpath/"})
require('dotenv').config({
    path: path.resolve('./config/.env'),
});

const rateLimit = require("express-rate-limit");

const NODE_ENV = process.env.NODE_ENV;
const WEBSITE_URL_DEV = process.env.WEBSITE_URL_DEV;
const WEBSITE_URL_PROD = process.env.WEBSITE_URL_PROD;
const WEBSITE_CSGO_APP_URL_PROD = process.env.WEBSITE_CSGO_APP_URL_PROD;
const SESSION_SECRET = process.env.SESSION_SECRET;

//security
const helmet = require("helmet");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { nanoid } = require("nanoid");

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//to sanitize all input
const mongoSanitize = require('express-mongo-sanitize');

//db
const {
    mongoDbUrl,
    dbConnection,
    connectToDb
 } = require("./db/db_connection");

const express = require("express");
const EXPRESS_PORT = process.env.EXPRESS_PORT;
const REACT_PORT = process.env.REACT_PORT;
const CSGO_APP_PORT = process.env.CSGO_APP_PORT;
const app = express();

//to set CORS between production and development for the reactjs served
const personal_website_origin = (NODE_ENV === "development"
    ? `http://${WEBSITE_URL_DEV}:${REACT_PORT}`
    : `https://${WEBSITE_URL_PROD}:${REACT_PORT}`
);

const csgo_app_origin = (NODE_ENV === "development"
    ? `http://${WEBSITE_URL_DEV}:${CSGO_APP_PORT}`
    : `https://${WEBSITE_CSGO_APP_URL_PROD}:${CSGO_APP_PORT}`
);

//set expressjs to use sessions
let sess = {
    genid: function (req) {
        return nanoid() // use nanoid for session IDs
    },
    resave: true,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    cookie: {},
    store: MongoStore.create({
        mongoUrl: mongoDbUrl,
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default
        autoRemove: 'native', // Default
        autoRemoveInterval: 10,
        crypto: {
            secret: SESSION_SECRET
        }
    })
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie['secure'] = true // serve secure cookies

    //set domain 
    sess.cookie['domain'] = "jordanho.ca";
}
else {
    sess.cookie.secure = false // serve insecure cookies for dev
}
app.use(session(sess))

//set rate limiting to prevent api spam
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

//apply to all requests
app.use(limiter);

// enable CORS
app.use(cors({
    credentials: true, // set credentials true for secure httpOnly cookie
    origin: [
        personal_website_origin,
        csgo_app_origin
    ] // url of the frontend application and csgo app
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

const publicRouter = require("./router/public/public_router");
const authRouter = require("./router/auth/auth_router");
const privateRouter = require("./router/private/private_router");
const csgoAppPublicRouter = require("./router/csgo/csgo_app_public_router");

//csgo app
app.use(csgoAppPublicRouter);

//public
app.use(publicRouter);

//routes for csrf and jwt tokens
app.use(authRouter);
app.use(privateRouter);

//for apps
app.use(privateRouter);

//setup content securtiy policy inclusions for aws s3, google api
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "https://private-personal-website-storage.s3.us-west-2.amazonaws.com/", "https://dkbz0bts1nczj.cloudfront.net/"],
                "script-src": ["'self'", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/", "https://csgo-app.jordanho.ca/", "https://jordanho.ca/"],
                "frame-src": ["'self'", "https://www.google.com/"],
                "default-src": ["'self'", "https://csgo-app.jordanho.ca/", "https://jordanho.ca/"],
                "connect-src": ["'self'", "https://csgo-app.jordanho.ca/", "https://jordanho.ca/"],
            },
        },
    })
);

//attempt to connect to db
let dbConnect = new Promise((resolve, reject) => {
    //establish database connection
    connectToDb().then(dbUrl => {
        console.error('Database connected to:', dbUrl);
        resolve(true)
    }).catch((err) => {
        console.error('Database Connection Error:', err);

        //close express js server as cannot connect to db
        process.exit(1)
    });
})

dbConnect.then(() => {
    //start server to listen to port
    let backendServer = new Promise(async (resolve) => {
        await app.listen(EXPRESS_PORT, () => {
            console.log(`ExpressJS Backend Server Started at Port: ${EXPRESS_PORT}`);
            resolve(true)
        });
    });

    //run frontend server if on production
    backendServer.then(() => {
        //if production
        let frontendServer = null;
        let csgowebapp = null;
        if (NODE_ENV === "production") {

            // //Personal website
            //front end server static build files
            app.use(express.static(path.join(__dirname, "./website-frontend/build")));

            app.get("*", function (req, res) {
                res.sendFile(path.join(__dirname, "./website-frontend/build", "index.html"));
            });

            frontendServer = app.listen(REACT_PORT, () => {
                console.log(`ExpressJS Frontend Server Started at Port: ${REACT_PORT}`);
            });
        }
    })
})