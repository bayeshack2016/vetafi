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
        line1: String,
        line2: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    fromAddress: {
        name: String, // Name line
        line1: String,
        line2: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    documents: [Buffer],
    user: Schema.Types.ObjectId
}, {
  timestamps: true
});

var Letter = mongoose.model('Letter', letterSchema);
module.exports = Letter;
