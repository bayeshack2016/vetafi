'use strict';
var uuid = require('uuid');
var _ = require('lodash');
var mongoose = require('mongoose');
var User = require('./user');
var Schema = mongoose.Schema;

var FileClaimSchema = new Schema({
  externalId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  state: String,         // FileClaim.State
  stateUpdatedAt: Date   // Date of last state modification
}, {
  timestamps: true
});

var State = {
  INCOMPLETE: 'incomplete',
  DISCARDED: 'discarded',
  SUBMITTED: 'submitted',
  PROCESSED: 'processed'
};

// Query helpers
// None yet

// Static methods
FileClaimSchema.statics.quickCreate = function(userId, callback) {
  var now = Date.now();
  return FileClaim.create({
    externalId: uuid.v4(),
    userId: userId,
    state: FileClaim.State.INCOMPLETE,
    stateUpdatedAt: now
  }, callback);
};

FileClaimSchema.statics.externalize = function(claim) {
  return _.pick(claim, ['externalId', 'state', 'updatedAt']);
};

// Instance methods
// None yet

var FileClaim = mongoose.model('FileClaim', FileClaimSchema);
module.exports = FileClaim;
module.exports.State = State;
