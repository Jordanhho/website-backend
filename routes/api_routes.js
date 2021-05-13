const api_routes = {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    VERIFY_TOKEN: "/api/auth/verify-token",
    SIGNUP: "/api/auth/signup",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_RESET_PASSWORD: "/api/auth/verify-reset-password",
    SEND_RESET_PASS_EMAIL: "/api/auth/send-reset-pass-email",

   


    RESET_PASSWORD_LINK: "/admin/login/reset_password/", //this is not an api route.
    EMAIL_VERIFICATION_LINK: "/admin/login/email_verification/" //todo change later, this is not an api route.

}

module.exports = api_routes;