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