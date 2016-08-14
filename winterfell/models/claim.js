'use strict';
var uuid = require('uuid');
var _ = require('lodash');
var mongoose = require('mongoose');
var User = require('./user');
var Schema = mongoose.Schema;

var ClaimSchema = new Schema({
  externalId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,       // Date of row creation
  updatedAt: Date,       // Date of last row modification
  state: String,         // Claim.State
  stateUpdatedAt: Date,  // Date of last state modification
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
ClaimSchema.statics.quickCreate = function(userId) {
  var now = Date.now();
  return Claim.create({
    externalId: uuid.v4(),
    userId: userId,
    createdAt: now,
    updatedAt: now,
    state: Claim.State.INCOMPLETE,
    stateUpdatedAt: now
  });
};

ClaimSchema.statics.externalize = function(claim) {
  return _.pick(claim, ['externalId', 'state', 'updatedAt']);
};

// Instance methods
// None yet

var Claim = mongoose.model('Claim', ClaimSchema);
module.exports = Claim;
module.exports.State = State;
