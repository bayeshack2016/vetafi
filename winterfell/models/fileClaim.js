'use strict';
var uuid = require('uuid');
var _ = require('lodash');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileClaimSchema = new Schema({
  externalId: String,
  userId: Number,
  createdAt: Date,       // Date of row creation
  updatedAt: Date,       // Date of last row modification
  state: String,         // FileClaim.State
  stateUpdatedAt: Date,  // Date of last state modification
});

var State = {
  INCOMPLETE: 'incomplete',
  COMPLETED: 'completed',
  DISCARDED: 'discarded',
  SUBMITTED: 'submitted',
  PROCESSED: 'processed'
};

// Query helpers
FileClaimSchema.query.byExternalId = function(extId) {
  return this.find({ externalId: extId });
};

FileClaimSchema.query.byUser = function(userId) {
  return this.find({ userId: userId });
};

FileClaimSchema.query.byUserAndState = function(userId, state) {
  return this.find({ userId: userId, state: state });
};

// Static methods
FileClaimSchema.statics.quickCreate = function(userId) {
  module.exports.quickCreate = function(userId) {
    var now = Date.now();
    return FileClaim.create({
      externalId: uuid.v4(),
      userId: userId,
      createdAt: now,
      updatedAt: now,
      state: FileClaim.State.INCOMPLETE,
      stateUpdatedAt: now
    });
  };
}

// Instance methods
FileClaimSchema.methods.externalize = function() {
  return _.pick(this, ['externalId', 'state', 'updatedAt']);
}

var FileClaim = mongoose.model('FileClaim', FileClaimSchema);
module.exports = FileClaim;
module.exports.State = State;
