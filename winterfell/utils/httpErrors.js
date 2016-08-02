function httpErrors(app) {
    this.app = app;
};

module.exports = httpErrors;

// User related errors (4xx)
module.exports.INVALID_USER_ID = "invalid_user_id";
module.exports.USER_NOT_FOUND = "user_not_found";
module.exports.USER_EXISTS = "user_exists";

// FileClaims related errors (4xx)
module.exports.INVALID_CLAIM_ID = "invalid_claim_id";
module.exports.CLAIM_NOT_FOUND = "claim_not_found";
module.exports.CLAIM_INCOMPLETE_EXISTS = "claim_incomplete_exists";

// Server related errors (5xx)
module.exports.DATABASE = "database_error";
module.exports.UNKNOWN = "unknown_error";

// Auth related errors
module.exports.AUTH_MISMATCH = "auth_mismatch";
module.exports.INVALID_EMAIL = "invalid_email";
module.exports.INVALID_PASSWORD = "invalid_password";
