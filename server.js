const path = require('path');

//note requires path ie: .config({ path: "/fullpath/"})
require('dotenv').config({
    path: path.resolve('./config/.env'),
});

const NODE_ENV = process.env.NODE_ENV;
const WEBSITE_URL_DEV = process.env.WEBSITE_URL_DEV;
const WEBSITE_URL_PROD = process.env.WEBSITE_URL_PROD;
const SESSION_SECRET = process.env.SESSION_SECRET;

//security
const helmet = require("helmet");
// const session = require('express-session');

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//to sanitize all input
const mongoSanitize = require('express-mongo-sanitize');

//db
const {
    dbConnection,
    connectToDb
 } = require("./db/db_connection");

const express = require("express");
const EXPRESS_PORT = process.env.EXPRESS_PORT;
const REACT_PORT = process.env.REACT_PORT;
const app = express();

//to set CORS between production and development for the reactjs served
const origin = (NODE_ENV === "development"
    ? `http://${WEBSITE_URL_DEV}:${REACT_PORT}`
    : `https://${WEBSITE_URL_PROD}:${REACT_PORT}`
);

// app.use(
//     session({
//         secret: SESSION_SECRET,
//         resave: true,
//         saveUninitialized: false,
//         cookie: {
//             sameSite: NODE_ENV === "production" ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
//             secure: NODE_ENV === "production", // must be true if sameSite='none'
//         }
//     })
// );

//session memory
//-momery unleaked---------
// app.set('trust proxy', 1);

// enable CORS
app.use(cors({
    credentials: true, // set credentials true for secure httpOnly cookie
    origin: origin // url of the frontend application
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

//public
app.use(publicRouter);

//routes for csrf and jwt tokens
app.use(authRouter);

app.use(privateRouter);


//for security
// app.use(helmet({
//     contentSecurityPolicy: {
        
//     }
// }));

//setup content securtiy policy inclusions for aws s3, google api
// app.use(
//     helmet.contentSecurityPolicy({
//         useDefaults: true,
//         directives: {
//             imgSrc: ["'self'", "https://private-personal-website-storage.s3.us-west-2.amazonaws.com"]
//         }
//     }
// ));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "s3.amazonaws.com"],
            },
        },
    })
);

       // defaultSrc: ["'self'"],
        // scriptSrc: ["'self'", 'code.jquery.com', 'maxcdn.bootstrapcdn.com'],
        // styleSrc: ["'self'", 'https://fonts.googleapis.com/'],
        // fontSrc: ["'self'", 'https://fonts.gstatic.com/'],

//set content security policy exclusions for aws s3 
// app.use(function (req, res, next) {
//     res.setHeader(
//        'Content-Security-Policy',
//         "default-src 'self'; font-src 'self' https://fonts.gstatic.com/; img-src 'self' https://private-personal-website-storage.s3.us-west-2.amazonaws.com; script-src 'self'; style-src 'self' https://fonts.googleapis.com/; frame-src 'self'"
//     );
//     return next();
// });

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
        if (NODE_ENV === "production") {
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