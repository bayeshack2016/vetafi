var lodash = require('lodash');
var validator = require('emailvalidator');
var User = require('./../models/user');

var MAX_PASSWORD_LENGTH = 6;

function UserService (app) {
    this.app = app;
};

function validateEmail(email) {
  // emailvalidator requires redis and sends a ping to the email to check its validity.
  //return validator.checkEmailAddress(email);
  return email.indexOf('@') > -1;
}

function validatePassword(password) {
  return password.length >= MAX_PASSWORD_LENGTH;
}

module.exports = UserService;
module.exports.createNewUser = function(user, callbacks) {
  var email = lodash.trim(user.email);
  var password = user.password;

  var errorCode = 0;
  var errorMsg = null;
  if (!validateEmail(email)) {
    errorCode = 400;
    errorMsg = "Email is not valid";
  }
  if (!validatePassword(password)) {
    errorCode = 400;
    errorMsg = "Password is too short";
  }

  if (errorCode == 0) {
    var newUser = {
      firstname: null,
      middlename: null,
      lastname: null,
      email: email,
      password: password,
      admin: false,
      userState: User.State.ACTIVE
    };
    User.quickCreate(newUser).then(function(user, error) {
      if (lodash.isEmpty(callbacks)) {
        return;
      } else if (user) {
        callbacks.onSuccess(user);
      } else {
        callbacks.onError(500, 'Database Error');
      }
    });
  } else {
    callbacks.onError(errorCode, errorMsg);
  }
};
