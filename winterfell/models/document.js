var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Represent a single document, which is a rendered pdf.
 */
var documentSchema = new Schema({
    key: String, // Code name for the form
    pdf: Buffer,
    user: Schema.Types.ObjectId
}, {
  timestamp: true
});

var Document = mongoose.model('Document', documentSchema);
module.exports = Document;
