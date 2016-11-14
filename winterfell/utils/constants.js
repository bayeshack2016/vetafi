function Constants(app) {
    this.app = app;
}

module.exports = Constants;
module.exports.SESSION_EXPIRE_TIME = 24 * 60 * 60 * 1000; // in millis
module.exports.environment = {
    TEST: 'test',
    LOCAL: 'local',
    PROD: 'prod'
};
module.exports.baseUrl = {
    LOCAL: 'http://localhost:3999',
    PROD: 'https://www.vetafi.org'
};

module.exports.KEY_LOB_API = 'lobApiKey';
module.exports.KEY_IDME_CLIENT_ID = 'idmeClientId';
module.exports.KEY_IDME_SECRET_ID = 'idmeSecretId';
module.exports.SESSION_SECRET_ID = 'sessionSecretId';
module.exports.biscuitKeys = {
  lobApiKey: 'lob-api-key',
  idmeClientId: 'id-me-client-id',
  idmeSecretId: 'id-me-client-secret',
  sessionSecretId: 'session-secret'
};

module.exports.ERROR_CODES = {
  EUSERNAMETAKEN: {
    message: "This email already being used. Try logging in with this email or try another email."
  },
  EAUTHFAILED: {
    message: "Unknown server issues. Please try again later."
  }
};
