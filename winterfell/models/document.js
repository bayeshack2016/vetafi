var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var documentSchema = new Schema({
    key: String,
    pdf: Buffer,
    user: Schema.Types.ObjectId
});

var Document = mongoose.model('Document', documentSchema);
module.exports = Document;

