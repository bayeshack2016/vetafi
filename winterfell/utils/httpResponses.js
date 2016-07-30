function httpResponses(app) {
    this.app = app;
};

module.exports = httpResponses;

// Http Codes (wrapper around standard http response status codes)
module.exports.CODE_SUCCESS = 200;
module.exports.CODE_BAD_REQUEST = 400;
module.exports.CODE_UNAUTHORIZED = 401;
module.exports.CODE_FORBIDDEN = 403;
module.exports.CODE_NOT_FOUND = 404;
module.exports.CODE_INTERNAL_SERVER_ERROR = 500;
module.exports.CODE_NOT_IMPLEMENTED = 501;

// User related errors (4xx)
module.exports.ERROR_INVALID_USER_ID = "invalid_user_id";
module.exports.ERROR_USER_NOT_FOUND = "user_not_found";
module.exports.ERROR_USER_EXISTS = "user_exists";

// FileClaims related errors (4xx)
module.exports.ERROR_INVALID_CLAIM_ID = "invalid_claim_id";
module.exports.ERROR_CLAIM_NOT_FOUND = "claim_not_found";
module.exports.ERROR_CLAIM_INCOMPLETE_EXISTS = "claim_incomplete_exists";

// Server related errors (5xx)
module.exports.ERROR_DATABASE = "database_error";
module.exports.ERROR_UNKNOWN = "unknown_error";

// Auth related errors
module.exports.ERROR_AUTH_MISMATCH = "auth_mismatch";
