'use strict';
var _ = require('lodash');
var addressSchema = require('./addressSchema');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('uuid');

var socialUserSchema = new Schema({
  type: String,                   // SocialUser.Type
  oauthToken: String,             // Token provided by oauth
  state: String,                  // SocialUser.State
  stateUpdatedAt: Date,
  createdAt: Date                 // When social was linked to this user
});

var contactSchema = new Schema({
  phoneNumber: String,
  address: {type: addressSchema, default: {}}
}, {minimize: false, timestamps: true});

var UserSchema = new Schema({
  firstname: String,                  // First name
  middlename: String,                 // Middle name
  lastname: String,                   // Last name
  email: String,                      // Email address
  externalId: String,                 // External User Id
  password: {type: String, select: false},      // Encrypted password, hide from app
  passwordSalt: {type: String, select: false},  // Password Salt for encrypting passwords, hide from app
  state: String,                      // User.State
  stateUpdatedAt: Date,               // Date of last state modification
  socialUsers: [socialUserSchema],
  admin: Boolean,                     // Is user an admin?
  test: Boolean,                       // Is user a test account?
  dateOfBirth: Date,                  // Date of Birth
  ssn: String,                        // Social Security Number
  contact: {type: contactSchema, default: {}}
}, {
  timestamps: true,
  minimize: false
});

var State = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Query helpers
// None yet

// Static methods
UserSchema.statics.quickCreate = function(user, callback) {
  var now = Date.now();
  return User.create({
    firstname: user.firstname,
    middlename: user.middlename || null,
    lastname: user.lastname,
    email: user.email,
    password: user.password,
    passwordSalt: user.passwordSalt,
    externalId: uuid.v4(),
    state: User.State.ACTIVE,
    stateUpdatedAt: now,
    socialUsers: [],
    admin: user.admin || false,
    test: user.test || false,
    contact: {address: {}}
  }, callback);
};

UserSchema.statics.externalize = function(user) {
  return _.pick(user, ['firstname', 'middlename', 'lastname', 'email', 'externalId', 'contact']);
};

// Instance methods
// None yet

var User = mongoose.model('User', UserSchema);
module.exports = User;
module.exports.Schema = UserSchema;
module.exports.State = State;

// By default, password and passwordSalt should not be revealed to the rest of the app.
// However, for several authentication purposes, we'll need to compare passwords
// in which case, the password needs to be selected from db
module.exports.findOneWithPassword = function(query) {
  return User.findOne(query).select('+password +passwordSalt');
};
