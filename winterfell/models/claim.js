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
  state: String,         // Claim.State
  stateUpdatedAt: Date,  // Date of last state modification
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
ClaimSchema.statics.quickCreate = function(userId, callback) {
  return Claim.create({
    externalId: uuid.v4(),
    userId: userId,
    state: Claim.State.INCOMPLETE,
    stateUpdatedAt: Date.now()
  }, callback);
};

ClaimSchema.statics.externalize = function(claim) {
  return _.pick(claim, ['externalId', 'state', 'updatedAt']);
};

// Instance methods
// None yet

var Claim = mongoose.model('Claim', ClaimSchema);
module.exports = Claim;
module.exports.State = State;
