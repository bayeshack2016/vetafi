'use strict';
var _ = require('lodash');
var AddressSchema = require('./addressSchema');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user');
var uuid = require('uuid');

var ClaimSchema = new Schema({
  externalId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  state: String,         // Claim.State
  stateUpdatedAt: Date,  // Date of last state modification
  sentTo: {
    emails: [String],
    addresses: [AddressSchema]
  }
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
  return _.pick(claim, ['externalId', 'state', 'updatedAt', 'sentTo']);
};

// Instance methods
// None yet

var Claim = mongoose.model('Claim', ClaimSchema);
module.exports = Claim;
module.exports.State = State;
