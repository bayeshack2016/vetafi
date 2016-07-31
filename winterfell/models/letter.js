var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Represent a letter that has been sent, containing multiple documents.
 */
var letterSchema = new Schema({
    vendorId: String, // Unique iq lob.com associates with the letter
    createdAt: Date,
    expectedDeliveryDate: Date,
    recipient: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,
    documents: [Schema.Types.ObjectId],
    user: Schema.Types.ObjectId
});

var Letter = mongoose.model('Letter', letterSchema);
module.exports = Letter;

