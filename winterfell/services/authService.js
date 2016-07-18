var _ = require('lodash');

function AuthService (app) {
    this.app = app;
};

module.exports = AuthService;
module.exports.isPasswordCorrect = function (expectedPwd, candidatePwd) {
  console.log('[AuthService] compare passwords: ' + expectedPwd + ' vs. ' + candidatePwd);
  if (_.isEqual(expectedPwd, candidatePwd)) {
    return true;
  } else {
    return false;
  }
};
