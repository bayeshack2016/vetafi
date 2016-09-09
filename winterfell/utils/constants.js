function Constants(app) {
    this.app = app;
}

module.exports = Constants;
module.exports.SESSION_EXPIRE_TIME = 20 * 60 * 1000; // in millis
module.exports.environment = {
    TEST: 'test',
    LOCAL: 'local',
    PROD: 'production'
};
