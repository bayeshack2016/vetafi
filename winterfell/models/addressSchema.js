'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var addressSchema = new Schema({
  name: String,                   // Name of Address (Home) (optional)
  street1: String,                // Street name & number
  street2: String,                // Secondary Address (Suite, Apt, Room, P.O.)
  city: String,                   // City
  province: String,               // Province or U.S. State
  postal: String,                 // Postal or U.S. Zip Code
  country: String                 // Country
}, {minimize: false, timestamps: false});

module.exports = addressSchema;
