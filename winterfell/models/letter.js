var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Represent a letter that has been sent, containing multiple documents.
 */
var letterSchema = new Schema({
    vendorId: String, // Unique iq lob.com associates with the letter
    expectedDeliveryDate: Date,
    toAddress: {
        name: String, // Name line
        street1: String,
        street2: String,
        city: String,
        province: String,
        postal: String,
        country: String
    },
    fromAddress: {
        name: String, // Name line
        street1: String,
        street2: String,
        city: String,
        province: String,
        postal: String,
        country: String
    },
    documents: [Buffer],
    user: Schema.Types.ObjectId
}, {
  timestamps: true
});

var Letter = mongoose.model('Letter', letterSchema);
module.exports = Letter;
