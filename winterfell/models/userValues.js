'use strict';
var mongoose = require('mongoose');
var User = require('./user');
var Schema = mongoose.Schema;

var UserValueSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: {unique: true}
  },
  values: Schema.Types.Mixed
}, { timestamps: true });

// Query helpers
// None yet

// Static methods
// None yet

// Instance methods
// None yet

var UserValues = mongoose.model('UserValue', UserValueSchema);
module.exports = UserValues;
