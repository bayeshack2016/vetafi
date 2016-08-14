var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var User = require('./../models/user');
var UserValues = require('./../models/userValues');

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
module.exports.createNewUser = function(user, callback) {
  var email = _.trim(user.email);
  var password = user.password;

  var errorObj = {
    code: 0,
    msg: ""
  };
  if (!validateEmail(email)) {
    errorObj.code = http.BAD_REQUEST;
    errorObj.msg = httpErrors.INVALID_EMAIL;
  }
  if (!validatePassword(password)) {
    errorObj.code = http.BAD_REQUEST;
    errorObj.msg = httpErrors.INVALID_PASSWORD;
  }

  if (errorObj.code == 0) {
    var newUser = {
      firstname: null,
      middlename: null,
      lastname: null,
      email: email,
      password: password,
      admin: false
    };
    return User.quickCreate(newUser, callback);
  } else if (_.isFunction(callback)) {
    callback(errorObj);
  }
  return null;
};

module.exports.setUserState = function(userId, state, callback) {
  var query = { _id: userId };
  var update = { state: state };
  return User.update(query, update, callback);
};

/**
 * Given a userId, and an object mapping { key: value },
 * Create a new 'values' object for UserValue or update all fields
 * in given mapping. Leave all all other fields as is.
 */
module.exports.upsertUserValues = function(userId, keyValues, callback) {
  UserValues.findOne({userId: userId}, function(err, userValue) {
    if (!userValue) {
      userValue = new UserValues;
      userValue.userId = userId;
      userValue.values = {};
    }
    _.forEach(_.keys(keyValues), function(key) {
      userValue.values[key] = keyValues[key];
    });
    userValue.markModified('values');
    userValue.save(callback);
  });
};
