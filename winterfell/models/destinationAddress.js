var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var destinationAddress = new Schema({
    key: String,
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
