"use strict";

const path = require('path');

//note requires path ie: .config({ path: "/fullpath/"})
require('dotenv').config({
    path: path.resolve('./config/.env'),
});

const rateLimit = require("express-rate-limit");

const NODE_ENV = process.env.NODE_ENV;
const WEBSITE_URL_DEV = process.env.WEBSITE_URL_DEV;
const WEBSITE_CSGO_APP_URL_PROD = process.env.WEBSITE_CSGO_APP_URL_PROD;
const SESSION_SECRET = process.env.SESSION_SECRET;

//security
const helmet = require("helmet");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { nanoid } = require("nanoid");

const cors = require("cors");

//for subdomains
// var vhost = require('vhost');

//db
const {
    mongoDbUrl,
} = require("./db/db_connection");

const REACT_PORT = process.env.REACT_PORT;
const express = require("express");
const CSGO_APP_PORT = process.env.CSGO_APP_PORT;
const app = express();
const csgoApp = express();

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
    sess.cookie['domain'] = "csgo-app.jordanho.ca";
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
        csgo_app_origin,
        personal_website_origin

    ] // url of the frontend application and csgo app
}));

//setup content securtiy policy inclusions for aws s3, google api
csgoApp.use(
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


csgoApp.use(express.static(path.join(__dirname, "./other_apps/csgo-utility-app/build")));
csgoApp.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "./other_apps/csgo-utility-app/build", "index.html"));
});

module.exports = csgoApp;





// dbConnect.then(() => {
//     //start server to listen to port
//     let backendServer = new Promise(async (resolve) => {
//         await app.listen(EXPRESS_PORT, () => {
//             console.log(`ExpressJS Backend Server Started at Port: ${EXPRESS_PORT}`);
//             resolve(true)
//         });
//     });

//     //run frontend server if on production
//     backendServer.then(() => {
//         //if production
//         let frontendServer = null;
//         let csgowebapp = null;
//         if (NODE_ENV === "production") {

//             // //Personal website
//             //front end server static build files
//             app.use(express.static(path.join(__dirname, "./website-frontend/build")));

//             app.get("*", function (req, res) {
//                 res.sendFile(path.join(__dirname, "./website-frontend/build", "index.html"));
//             });

//             frontendServer = app.listen(REACT_PORT, () => {
//                 console.log(`ExpressJS Frontend Server Started at Port: ${REACT_PORT}`);
//             });

//             csgoApp.use(express.static(path.join(__dirname, "./other_apps/csgo-utility-app/build")));
//             csgoApp.get("*", function (req, res) {
//                 res.sendFile(path.join(__dirname, "./other_apps/csgo-utility-app/build", "index.html"));
//             });
//             express().use(vhost("csgo-app.jordanho.ca", csgoApp)).listen(CSGO_APP_PORT, () => {
//                 console.log(`CSGO App Frontend Server Started at Port: ${CSGO_APP_PORT}`);
//             });

//             // //CSGO Web app
//             // app.use(express.static(path.join(__dirname, "./other_apps/csgo-utility-app/build")));

//             // app.get("*", function (req, res) {
//             //     res.sendFile(path.join(__dirname, "./other_apps/csgo-utility-app/build", "index.html"));
//             // });



//             // csgowebapp = app.listen(CSGO_APP_PORT, () => {
//             //     console.log(`CSGO App Frontend Server Started at Port: ${CSGO_APP_PORT}`);
//             // });
//         }
//     })
// })