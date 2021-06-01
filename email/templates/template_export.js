const email_templates = {
    account_activation: {
        fileName: 'account_activation.ejs',
        subject: 'Email Activation Code',
    },
    password_reset: {
        fileName: 'password_reset.ejs',
        subject: 'Password Reset Code',
    },
    password_changed: {
        fileName: 'password_changed.ejs',
        subject: 'Password Changed'
    }
};

module.exports = {
    email_templates
}