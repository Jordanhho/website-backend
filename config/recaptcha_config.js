const fetch = require('node-fetch');

//returns true or false if recaptcha has been verified
function verifyRecaptcha(req) {
    return new Promise((resolve, reject)=> {

        if (!req.body.recaptcha_token || !req.connection.remoteAddress) {
            resolve(false);
        }
        console.log(req.body.recaptcha_token)
        console.log(req.connection.remoteAddress);

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.recaptcha_token}&remoteip=${req.connection.remoteAddress}`;

        console.log(url);

        fetch(url, {
            method: "post",
        })
        .then((res) => res.json()).then((google_res) => {
                if (google_res.success == true) {
                    resolve(true);
                } else {
                    console.log(google_res);
                    resolve(false);
                }
            })
            .catch((error) => {
                console.log(error)
                resolve(false);
            });
        });

    // // let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // // Hitting GET request to the URL, Google will respond with success or error scenario.
    // await request(verificationUrl, function (error, response, body) {
    //     body = JSON.parse(body);
    //     // Success will be true or false depending upon captcha validation.
    //     if (body.success !== undefined && !body.success) {
    //         return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
    //     }
    //     return res.json({ "responseCode": 0, "responseDesc": "Success" });
    // });
}

module.exports = {
    verifyRecaptcha
};
