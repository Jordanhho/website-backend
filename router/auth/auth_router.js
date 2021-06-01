const express = require('express'),
router = express.Router();

const moment = require('moment');
const ms = require('ms');

const apiRoutes = require("../api_routes/auth_api_routes")

//email
const {
    sendEmail
} = require("../../controllers/email_controller");

const {
    getHashedPassword
} = require("../../config/hashing");

//recaptcha verification
const {
    verifyRecaptcha
} = require("../../config/recaptcha_config");


//connect to mongo db server
const {
    getUserByUserId,
    getUserByEmail,
    getUserByEmailAndPassword,
    insertUser,
    updateUserByEmail,

    getTempUserByEmail,
    getTempUserByActivationCodeAndEmail,
    upsertTempUser,
    removeTempUserByEmail,

    getResetPassUserByVerificationCodeAndEmail,
    getResetPassUserByVerificationTokenAndEmail,
    upsertResetPassUser,
    updateResetPassUserByEmail,
    removeResetPassUserByEmail
} = require("../../controllers/db/auth_db_controller");

//jwt and csrf token auth
const {
    activeRefreshTokenList,
    COOKIE_OPTIONS,
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    clearTokens,
} = require("../../config/csrf_jwt_utils");

const {
    handleRes
} = require("../response");

const {
    apiDebugMsges
} = require("../../config/debug");

const {
    getNanoid,
    getVerificationCode,
    getActivationCode,
    getVerificationToken,
    getActivationCodeExpiry,
    getResetPasswordCodeExpiryTime,
    getResetPasswordTokenExpiryTime
} = require("../../config/verification_gen");

//TODO remove later
const RECAPTCHA_ENABLE = (process.env.RECAPTCHA_ENABLE === "true");
const RESET_PASSWORD_VERIFICATION_CODE_EXPIRE = process.env.RESET_PASSWORD_VERIFICATION_CODE_EXPIRE;
const EMAIL_VERIFICATION_CODE_EXPIRE = process.env.EMAIL_VERIFICATION_CODE_EXPIRE;
const WEB_URL = process.env.WEB_URL;
const REACT_PORT = process.env.REACT_PORT;


//** POST REQUESTS **//


//** User Login Process */

//user login authentication
router.post(apiRoutes.LOGIN, async function (req, res) {
    apiDebugMsges(apiRoutes.LOGIN, req);

    //check if data is empty
    if (!req.body.email || !req.body.password) {
        return handleRes(
            req, 
            res, 
            200, 
            null,
            "Missing Required Fields"
        );
    }
    const loginObj = req.body;

    //make sure email is lowercase
    const email = loginObj.email.toLowerCase().trim();
    const password = loginObj.password.trim();

    // return 400 status if username/password is not exist
    if (!email || !password) {
        return handleRes(
            req, 
            res, 
            400, 
            "Username and Password required."
        );
    }

    //Find user in db by password and email
    const userDbObj = await getUserByEmailAndPassword(email, password);

    //return 404 if no such user exists in db or password/email is incorrect
    if (!userDbObj) {
        return handleRes(
            req, 
            res, 
            401, 
            "Invalid email or password.",
            "No user was found or incorrect login details"
        );
    }

    //generate access token from data in cleanUserObj async
    const accessTokenGenPromise = new Promise((resolve) => {
        resolve(generateAccessToken(userDbObj));
    });

    //generate refresh token from userid async
    const refreshTokenGenPromise = new Promise((resolve) => {
        resolve(generateRefreshToken(userDbObj.userid));
    });

    //attempt to generate both refresh and access token async to speed up process
    Promise.all([accessTokenGenPromise, refreshTokenGenPromise]).then((dataList) => {
        const accessTokenObj = dataList[0];
        const refreshToken = dataList[1];

        //refresh token list to manage the csrf token
        activeRefreshTokenList[refreshToken] = accessTokenObj.xsrfToken;

        //set refresh token and csrf token into cookies for response
        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
        res.cookie("XSRF-TOKEN", accessTokenObj.xsrfToken);

        return handleRes(
            req, 
            res, 
            200, 
            null,
            "Successfully logged in user: " + email,
            {
                user: userDbObj,
                refreshToken: accessTokenObj.refreshToken,
                expiredAt: accessTokenObj.expiredAt
            }
        );
    });
});


//verify login session
router.post(apiRoutes.VERIFY_LOGIN_SESSION, function (req, res) {
    apiDebugMsges(apiRoutes.VERIFY_LOGIN_SESSION, req);

    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (!refreshToken) {
        return handleRes(
            req, 
            res, 
            204, 
            null,
            "Refresh token does not exist"
        );
    }

    // verify xsrf token
    const xsrfToken = req.headers['x-xsrf-token'];
    if (!xsrfToken
        || !(refreshToken in activeRefreshTokenList)
        || activeRefreshTokenList[refreshToken] !== xsrfToken) {
        return handleRes(
            req, 
            res, 
            401,
            null,
            "Either: no csrf token, no refresh token that is active, or invalid refresh token"
        );
    }

    // verify refresh token
    verifyToken(refreshToken, '', async (err, payload) => {
        if (err) {
            return handleRes(
                req, 
                res, 
                401,
                err
            );
        }
        const userDbObj = await getUserByUserId(payload.userid);

        //correct token but no such user
        if (!userDbObj) {
            return handleRes(
                req, 
                res, 
                401,
                null,
                "Valid refresh token but no such user"
            );
        }
        //generate access token
        const accessTokenObj = await generateAccessToken(userDbObj);

        //refresh token list to manage the xsrf token
        activeRefreshTokenList[refreshToken] = accessTokenObj.xsrfToken;
        res.cookie('XSRF-TOKEN', accessTokenObj.xsrfToken);

        // return the token along with user details
        return handleRes(
            req, 
            res, 
            200, 
            null,
            "Successfully verified active refresh token and user",
            {
                user: userDbObj,
                refreshToken: accessTokenObj.refreshToken,
                expiredAt: accessTokenObj.expiredAt
            }
        );
    });
});

//logout api
router.post(apiRoutes.LOGOUT, (req, res) => {
    apiDebugMsges(apiRoutes.LOGOUT, req);

    clearTokens(req, res);
    return handleRes(
        req,
        res, 
        204,
        null,
        "Successfully logged user out"
    );
});


//** User Sign up Process */

//user signup api
router.post(apiRoutes.SIGNUP, function (req, res) {
    apiDebugMsges(apiRoutes.SIGNUP, req);

    //check if data is empty
    if (!req.body.email
        || !req.body.password
        || !req.body.firstname
        || !req.body.lastname) {
        return handleRes(
            req, 
            res, 
            200, 
            null,
            "Missing Required Fields"
        );
    }

    const signUpObj = req.body;
    const email = signUpObj.email.toLowerCase().trim();
    //hash the password as well
    const password = signUpObj.password.trim(); 

    //check if there already exists a signup request with the email
    const tempUserPromise = new Promise((resolve, reject) => {
        resolve(getTempUserByEmail(email));
    });

    //check if there already exists a full user with that email
    const userPromise = new Promise((resolve, reject) => {
        resolve(getUserByEmail(email));
    });

    //attempt to generate both refresh and access token async to speed up process
    Promise.all([tempUserPromise, userPromise]).then(async (dataList) => {
        const tempUserDbObj = dataList[0];
        const userDbObj = dataList[1];

        //if a full account already exists
        if (userDbObj) {
            return handleRes(
                req,
                res,
                200,
                null,
                "An account with that email already exists"
            );
        }

        //if temp account exists and has not expired.
        if (tempUserDbObj && moment().isBefore(tempUserDbObj.activation_code_expire_at)) {
            return handleRes(
                req,
                res,
                200,
                null,
                "An email has already been sent to activate your account",
                {
                    "activation_email_sent": true
                }
            );
        }

        //If expired link, just re-create the temp account

        //no full account exists, or temp account has expired so upsert new temp account
        //create temp account, password hash done in dbcontroller
        //also hash the password
        const hashedPasswordPromise = new Promise((resolve, reject) => {
            resolve(getHashedPassword(password));
        });
        
        const activationCodePromise = new Promise((resolve, reject) => {
            resolve(getActivationCode());
        });

        Promise.all([hashedPasswordPromise, activationCodePromise]).then(async (dataList) => {
            const hashedPassword = dataList[0];
            const activation_code = dataList[1];

            const newTempUser = {
                email: email,
                password: hashedPassword,
                firstname: signUpObj.firstname.trim(),
                lastname: signUpObj.lastname.trim(),
                activation_code: activation_code,
                activation_code_expire_at: getActivationCodeExpiry()
            };

            //upsert temp user in db
            const upsertedTempUserDbObj = await upsertTempUser(newTempUser);

            if (!upsertedTempUserDbObj) {
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "An error has occured when creating the temp account"
                );
            }

            const emailData = {
                template: "account_activation",
                to: upsertedTempUserDbObj.email,
                vars: {
                    activation_code: upsertedTempUserDbObj.activation_code,
                    expire_in_hours: moment.duration(ms(EMAIL_VERIFICATION_CODE_EXPIRE)).asHours(),
                    activation_link: `http://${WEB_URL}:${REACT_PORT}/admin/login/activate_account/${upsertedTempUserDbObj.email}/${upsertedTempUserDbObj.activation_code}`
                }
            }
            try {
                //send a activation email to created user
                const info = await sendEmail(
                    emailData
                );
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "An email has been sent to your account for sign up activation",
                    {
                        "activation_email_sent": true
                    }
                );
            } catch (err) {
                return handleRes(
                    req,
                    res,
                    200,
                    null,
                    "Something happened while attempting to send an email activation"
                );
            }
        });
    });
});


// on click of verifiying email with code sent to email to activate account
router.post(apiRoutes.ACTIVATE_ACCOUNT, async function (req, res) {
    apiDebugMsges(apiRoutes.ACTIVATE_ACCOUNT, req);

    if (!req.body.email || !req.body.activation_code) {
        return handleRes(
            req, 
            res, 
            200, 
            null,
            "Missing Required Fields"
        );
    }
    
    const email = req.body.email.toLowerCase().trim();
    const activation_code = req.body.activation_code.trim();

    const tempUserDbObj = await getTempUserByActivationCodeAndEmail(email, activation_code);

    //if no temp user was found 
    if (!tempUserDbObj) {   
        return handleRes(
            req,
            res,
            200,
            null,
            "Invalid activation code",
            "No temp user entry was found from activation code and email"
        );
    }
    
    //check if expired code
    if (moment().isAfter(tempUserDbObj.activation_code_expire_at)) {
        return handleRes(
            req,
            res,
            200,
            "Invalid activation code",
            "Temp user was found, but the activation code has expired"
        );
    }

    //verified email, now delete temp account information
    const deletedTempUser = await removeTempUserByEmail(tempUserDbObj.email);
    if (!deletedTempUser) {
        return handleRes(
            req,
            res,
            200,
            "Something went wrong with activating your account",
            "Failed to delete temp user entry"
        );
    }

    //now create a new user
    //the password does not need to be hashed as it has been hashed from tempUser db
    const userid = await getNanoid();
    
    const newUserObj = {
        email: tempUserDbObj.email,
        userid: userid,
        password: tempUserDbObj.password,
        firstname: tempUserDbObj.firstname,
        lastname: tempUserDbObj.lastname
    }
    const insertedUser = await insertUser(newUserObj);
    if (!insertedUser) {
        return handleRes(
            req,
            res,
            200,
            "Something went wrong with activating your account",
            "Failed to create a new user entry"
        );
    }

    return handleRes(
        req, 
        res, 
        200, 
        null,
        "Successfully verified user email verification code",
        {
            "activated_account": true
        }
    );
});



//** User Reset password Process */


// on click send email to reset password
router.post(apiRoutes.SEND_RESET_PASSWORD_EMAIL, async function (req, res) {
    apiDebugMsges(apiRoutes.SEND_RESET_PASSWORD_EMAIL, req);

    if (!req.body.recaptcha_token || !req.body.email) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Missing Required Fields",
            false
        );
    }

    //verify captcha
    let verifiedCaptcha;
    if (RECAPTCHA_ENABLE) {
        verifiedCaptcha = await verifyRecaptcha(req);
        //check if not a bot
        if (!req.verifiedCaptcha) {
            return handleRes(
                req, 
                res, 
                200, 
                "Something went wrong with sending reset password email",
                "Something went wrong with recaptcha verification",
                false
            );
        }
    }

    const email = req.body.email.toLowerCase().trim();
    const userDbObj = await getUserByEmail(email);

    //check if there exists an email related to an account. 
    if (!userDbObj) {
        return handleRes(
            req, 
            res, 
            200, 
            null,
            "No such user with this email",
            false
        );
    }

    const verification_code = await getVerificationCode();

    //upsert the entry in the reset password user table for this user.
    const newResetPassUserObj = {
        email: userDbObj.email,
        verification_code: verification_code,
        verification_code_expire_at: getResetPasswordCodeExpiryTime(),
        verification_token: null,
        verification_token_expire_at: null
    }

    const resetPassUserDbObj = await upsertResetPassUser(newResetPassUserObj);
    if (!resetPassUserDbObj) {
        return handleRes(
            req,
            res,
            200,
            null,
            "An error has occured when creating the reset pass user entry",
            false
        );
    }

    const emailData = {
        template: "password_reset",
        to: userDbObj.email,
        vars: {
            verification_code: resetPassUserDbObj.verification_code,
            expire_in_minutes: moment.duration(ms(RESET_PASSWORD_VERIFICATION_CODE_EXPIRE)).asMinutes()
        }
    }
    try {
        const info = await sendEmail(
            emailData
        );
        return handleRes(
            req,
            res,
            200,
            null,
            "An email has been sent to your account for sign up verification",
            {
                email_sent: true
            }
        );
    } catch (err) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Something happened while attempting to send an email verification",
            false
        );
    }
});


//verify a reset password request
router.post(apiRoutes.VERIFY_RESET_PASSWORD_CODE, async function (req, res) {
    apiDebugMsges(apiRoutes.VERIFY_RESET_PASSWORD_CODE, req);

    if (!req.body.email || !req.body.verification_code) {
        return handleRes(
            req, 
            res, 
            200, 
            null, 
            "Missing Required Fields",
            false
        );
    }

    const email = req.body.email.toLowerCase().trim();
    const verification_code = req.body.verification_code;

    const resetPassUserDbObj = await getResetPassUserByVerificationCodeAndEmail(email, verification_code);

    //if no reset pass user was found 
    if (!resetPassUserDbObj) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Invalid verification code",
            "No reset pass user entry was found from verification code and email",
            false
        );
    }

    //check if expired code
    if (moment().isAfter(resetPassUserDbObj.verification_code_expire_at)) {
        return handleRes(
            req,
            res,
            200,
            "Invalid verification code",
            "Reset pass user was found, but the verification code has expired",
            false
        );
    }

    //successfully verified code and not expired. create a verification token and pass it to the user to complete the reset password prcoess
    const verification_token = await getVerificationToken();

    const updateData = {
        email: resetPassUserDbObj.email,
        verification_code: null,
        verification_code_expire_at: null,
        verification_token: verification_token,
        verification_token_expire_at: getResetPasswordTokenExpiryTime()
    }
    const updatedResetPassUserDbObj = await updateResetPassUserByEmail(updateData);
    if (!updatedResetPassUserDbObj) {
        return handleRes(
            req,
            res,
            200,
            null,
            "An error has occured when updating the reset pass user with verification token",
            false
        );
    }

    return handleRes(
        req, 
        res, 
        200, 
        "Successfully verified reset password verification code",
        "Successfully verified verification code",
        {
            verified_code: true,
            verification_token: updatedResetPassUserDbObj.verification_token
        }
    );
});

//on click of forget password, the user sends an email + captcha. If the email exists, it will send it. 
router.post(apiRoutes.RESET_PASSWORD, async function (req, res) {
    apiDebugMsges(apiRoutes.RESET_PASSWORD, req);

    if (!req.body.email 
        || !req.body.verification_token
        || !req.body.password
        ) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Missing Required Fields",
            false
        );
    }

    const email = req.body.email.toLowerCase().trim();
    const verification_token = req.body.verification_token;
    const password = req.body.password.trim();

    const resetPassUserDbObj = await getResetPassUserByVerificationTokenAndEmail(email, verification_token);

    //if no reset pass user was found 
    if (!resetPassUserDbObj) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Invalid verification token",
            "No reset pass user entry was found from verification token and email",
            false
        );
    }

    //check if expired code
    if (moment().isAfter(resetPassUserDbObj.verification_token_expire_at)) {
        return handleRes(
            req,
            res,
            200,
            "Invalid verification token",
            "Reset pass user was found, but the verification token has expired",
            false
        );
    }

    //modify user
    //hash password
    const hashedPassword = await getHashedPassword(password);
  
    let updateUserObj = {
        password: hashedPassword,
        email: resetPassUserDbObj.email
    }

    //update user data
    const userDbObj = await updateUserByEmail(updateUserObj);

    if (!userDbObj) {
        return handleRes(
            req, 
            res, 
            200, 
            "Something went wrong with changing pasword", 
            "Failed to update user with new password",
            false
        );
    }

    //delete reset user pass data
    const deletedResetPassUser = await removeResetPassUserByEmail(resetPassUserDbObj.email);
    if (!deletedResetPassUser) {
        return handleRes(
            req,
            res,
            200,
            "Something went wrong with changing pasword",
            "Failed to delete reset pass user entry",
            false
        );
    }

    //send password reset notification to email
    const emailData = {
        template: "password_changed",
        to: userDbObj.email,
        vars: {}
    }
    try {
        const info = await sendEmail(
            emailData
        );
        return handleRes(
            req,
            res,
            200,
            null,
            "An email has been sent to your account to notify password change",
            {
                password_changed: true
            }
        );
    } catch (err) {
        return handleRes(
            req,
            res,
            200,
            null,
            "Something happened while attempting to send an email to notify password change",
            false
        );
    }
});

module.exports = router;