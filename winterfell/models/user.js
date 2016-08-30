'use strict';
var _ = require('lodash');
var uuid = require('uuid');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var socialUserSchema = new Schema({
  type: String,                   // SocialUser.Type
  oauthToken: String,             // Token provided by oauth
  state: String,                  // SocialUser.State
  stateUpdatedAt: Date,
  createdAt: Date                 // When social was linked to this user
});

var UserSchema = new Schema({
  firstname: String,                  // First name
  middlename: String,                 // Middle name
  lastname: String,                   // Last name
  email: String,                      // Email address
  externalId: String,                 // External User Id
  password: String,                   // Encrypted password
  state: String,                      // User.State
  stateUpdatedAt: Date,               // Date of last state modification
  socialUsers: [socialUserSchema],
  admin: Boolean,                     // Is user an admin?
  test: Boolean,                       // Is user a test account?

  dateOfBirth: Date,                  // Date of Birth
  ssn: String,                        // Social Security Number
  contact: {                          // Anything related to contact information
    phoneNumber: String,              // Phone Number
    address: {                        // Anything related to address
      name: String,                   // Name of Address (Home) (optional)
      line1: String,                  // Street name & number
      line2: String,                  // Secondary Address (Suite, Apt, Room, P.O.)
      city: String,                   // City
      state: String,                  // U.S. State
      zip: String,                    // U.S. ZipCode
      country: String                 // Country
    }
  }

}, {
  timestamps: true
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
    externalId: uuid.v4(),
    state: User.State.ACTIVE,
    stateUpdatedAt: now,
    socialUsers: [],
    admin: user.admin || false,
    test: user.test || false
  }, callback);
};

UserSchema.statics.externalize = function(user) {
  return _.pick(user, ['firstname', 'middlename', 'lastname', 'email', 'externalId']);
};

// Instance methods
// None yet

var User = mongoose.model('User', UserSchema);
module.exports = User;
module.exports.Scema = UserSchema;
module.exports.State = State;
