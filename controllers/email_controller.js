const nodemailer = require('nodemailer');
const ejs = require('ejs');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const SERVER_EMAIL_ENABLE = (process.env.SERVER_EMAIL_ENABLE === "true");

const { email_templates } = require("../email/templates/template_export");

const {
    sendEmailDebugMsges
} = require("../config/debug");

const {
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN,
    SERVER_EMAIL,
    SERVER_EMAIL_PROVIDER
} = process.env;

const oauth2Client = new OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

//gets the rendered html template from ejs for email
async function getHTMLTemplate(vars, filePath) {
    const renderedHtml = await new Promise((resolve, reject) => { 
        ejs.renderFile(filePath, vars, {}, (err, content) => {
            if(err) {
                console.log(err);
                resolve(null);
            }
            else {
                resolve(content);
            }
        });
    });
    return renderedHtml;
}

//send email
async function sendEmail(data) {
    oauth2Client.setCredentials({
        refresh_token: OAUTH_REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                sendEmailDebugMsges(err);
                reject("Failed to create access token");
            }
            resolve(token);
        });
    });

    const filePath = `${__dirname}/../email/templates/${email_templates[data.template].fileName}`;

    //get html template for email
    const html = await getHTMLTemplate(data.vars, filePath);

    const transporter = nodemailer.createTransport({
        service: SERVER_EMAIL_PROVIDER,
        auth: {
            type: "OAuth2",
            user: SERVER_EMAIL,
            accessToken,
            clientId: OAUTH_CLIENT_ID,
            clientSecret: OAUTH_CLIENT_SECRET,
            refreshToken: OAUTH_REFRESH_TOKEN
        },
    });

    const mailOptions = {
        from: SERVER_EMAIL,
        to: data.to,
        subject: email_templates[data.template].subject,
        html: html
    };

    if (SERVER_EMAIL_ENABLE) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                sendEmailDebugMsges(err, data);
                return err;
            }
            sendEmailDebugMsges("sending an email to: ", data.to, data);
            return info;
        });
    }
    else {
        return true;
    }
};

module.exports = {
    sendEmail
};