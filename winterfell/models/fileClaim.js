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
  fileNumber: String,    // VA file number given after processing
  createdAt: Date,       // Date of row creation
  updatedAt: Date,       // Date of last row modification
  state: String,         // FileClaim.State
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
FileClaimSchema.statics.quickCreate = function(userId) {
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

FileClaimSchema.statics.externalize = function(claim) {
  return _.pick(claim, ['externalId', 'state', 'updatedAt']);
};

// Instance methods
// None yet

var FileClaim = mongoose.model('FileClaim', FileClaimSchema);
module.exports = FileClaim;
module.exports.State = State;
