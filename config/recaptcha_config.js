const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

async function verifyRecaptcha(req) {
    let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    await request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if (body.success !== undefined && !body.success) {
            return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
        }
        return res.json({ "responseCode": 0, "responseDesc": "Success" });
    });
}

module.exports = {
    verifyRecaptcha
};
