'use strict';
var uuid = require('uuid');
var _ = require('lodash');
var mongoose = require('mongoose');
var SocialUser = require('./socialUser');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  firstname: String,                                // First name
  middlename: String,                               // Middle name
  lastname: String,                                 // Last name
  email: String,                                    // Email address
  externalId: String,                               // External User Id
  password: String,                                 // Encrypted password
  createdAt: Date,       // Date of row creation
  updatedAt: Date,       // Date of last row modification
  state: Number,                                    // User.State
  stateUpdatedAt: Date,  // Date of last state modification
  socialUsers:[{
      type: Schema.Types.ObjectId,
      ref: 'SocialUser'
  }],
  admin: Boolean,                                   // Is user an admin?
  test: Boolean                                     // Is user a test account?
});

var State = {
  ACTIVE: 0,
  INACTIVE: 1
};

// Get methods
userSchema.statics.getByExtId = function(extId, callback) {
  return this.model('User').findOne({externalId: extId, state: User.State.ACTIVE}, callback);
}

var User = mongoose.model('User', userSchema);
module.exports = User;
module.exports.State = State;

//
// Serialize
//
module.exports.externalize = function(user) {
  return _.pick(user, ['firstname', 'middlename', 'lastname', 'email', 'externalId']);
};

//
// Inserts
//
module.exports.quickCreate = function(user, callbacks) {
  var now = Date.now();
  return User.create({
    firstname: user.firstname,
    middlename: user.middlename || null,
    lastname: user.lastname,
    email: user.email,
    password: user.password,
    externalId: uuid.v4(),
    createdAt: now,
    updatedAt: now,
    state: User.State.ACTIVE,
    stateUpdatedAt: now,
    admin: user.admin,
    test: false
  });
};
