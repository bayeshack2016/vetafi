var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recipientSchema = new Schema({
    type: String, // User or government office
    name: String, // Name line
    createdAt: Date,
    updatedAt: Date,
    addressLine1: String,
    addressLine2: String,
    addressCity: String,
    addressState: String,
    addressZip: String,
    addressCountry: String
});

var Recipient = mongoose.model('Recipient', recipientSchema);
module.exports = Recipient;
