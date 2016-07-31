var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Represent the address of a VA office or other location where
 * paperwork is received.
 *
 * This is essentially the same as UserAddress, but having a different model
 * allows us to logically ensure paperwork is never sent to another user
 * accidentally.
 */
var destinationAddress = new Schema({
    key: String, // Code name for this office
    name: String, // Name line
    addressLine1: String,
    addressLine2: String,
    addressCity: String,
    addressState: String,
    addressZip: String,
    addressCountry: String
});

var DestinationAddress = mongoose.model('DestinationAddress', destinationAddress);
module.exports = DestinationAddress;
