function Constants(app) {
    this.app = app;
}

module.exports = Constants;
module.exports.SESSION_EXPIRE_TIME = 1200; // in seconds
module.exports.environment = {
    TEST: 'test',
    LOCAL: 'local',
    PROD: 'production'
};

module.exports.KEY_LOB_API = 'lobApiKey';
module.exports.KEY_IDME_CLIENT_ID = 'idmeClientId';
module.exports.KEY_IDME_SECRET_ID = 'idmeSecretId';
module.exports.biscuitKeys = {
  lobApiKey: 'lob-api-key',
  idmeClientId: 'id-me-client-id',
  idmeSecretId: 'id-me-client-secret'
};
