var bcrypt = require('bcryptjs');
var DEFAULT_SALT_ROUNDS = 10;

function AuthUtil(app) {
    this.app = app;
}

module.exports = AuthUtil;
module.exports.generatePasswordSalt = function() {
  return bcrypt.genSaltSync(DEFAULT_SALT_ROUNDS);
};

module.exports.generatePassword = function(pwd, salt) {
  return bcrypt.hashSync(pwd, salt);
};

module.exports.isPasswordCorrect = function (expectedPwd, candidatePwd) {
  return bcrypt.compareSync(candidatePwd, expectedPwd);
};
