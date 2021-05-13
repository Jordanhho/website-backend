const nodemailer = require('nodemailer');

let testAccount;
let transporter;

async function initializeNodeMailer() {
    testAccount = await nodemailer.createTestAccount(); //for testing purposes


    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    console.log("initialized NodeMailer");
}


// const transporter = nodemailer.createTransport({
//     service: process.env.SRV_EMAIL_PROVIDER,
//     port: 25,
//     secure: false, 
//     logger: true,
//     debug: true,
//     secureConnection: false,
//     auth: {
//         user: process.env.SERVER_EMAIL,
//         pass: process.env.SERVER_EMAIL_PASSWORD
//     },
//     ignoreTLS: true // add this 
// });


initializeNodeMailer();


module.exports = {
    //To can be a list for multiple ie: "email, email2, email3"
    //you can also change text to html for easy html formatting.
    makeEmailObj: function (from, to, subject, text) {
        return {
            from: process.env.SERVER_EMAIL,
            to: to,
            subject: subject,
            text: text
        }
    },

    sendEmail: async function (to, subject, html) {
        const emailObj = {
            from: testAccount.user, //TODO must change to gmail later
            to: to,
            subject: subject,
            html: html
        }
        transporter.sendMail(emailObj, function (error, info) {
            if (error) {
                console.log(error);
                return error;
            } else {
                console.log(info);
                console.log('Email sent: ' + info.response);
                return info.response;
            }
        });
    }


};