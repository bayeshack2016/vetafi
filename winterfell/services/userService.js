var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var User = require('./../models/user');

var MAX_PASSWORD_LENGTH = 6;

function UserService(app) {
    this.app = app;
};

function validateEmail(email) {
  return email.indexOf('@') > -1 && email.indexOf('.') > -1;
}

function validatePassword(password) {
  return password.length >= MAX_PASSWORD_LENGTH;
}

module.exports = UserService;
module.exports.createNewUser = function(user, callbacks) {
  var email = _.trim(user.email);
  var password = user.password;

  var errorCode = 0;
  var errorMsg = null;
  if (!validateEmail(email)) {
    errorCode = http.BAD_REQUEST;
    errorMsg = httpErrors.INVALID_EMAIL;
  }
  if (!validatePassword(password)) {
    errorCode = http.BAD_REQUEST;
    errorMsg = httpErrors.INVALID_PASSWORD;
  }

  if (errorCode == 0) {
    var newUser = {
      firstname: null,
      middlename: null,
      lastname: null,
      email: email,
      password: password,
      admin: false
    };
    return User.quickCreate(newUser).then(function(user, error) {
      if (user) {
        _.isEmpty(callbacks) ? null : callbacks.onSuccess(user);
      } else {
        _.isEmpty(callbacks) ? null : callbacks.onError(http.INTERNAL_SERVER_ERROR, httpErrors.DATABASE);
      }
    });
  } else if (!_.isEmpty(callbacks)) {
    callbacks.onError(errorCode, errorMsg)
  }
  return null;
};

module.exports.setUserState = function(userId, state, callback) {
  var query = { _id: userId };
  var update = { state: state };
  return User.update(query, update, callback);
};
