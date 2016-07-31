var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var letterSchema = new Schema({
    externalId: String,
    createdAt: Date,
    expectedDeliveryDate: Date,
    recipient: Schema.Types.ObjectId,
    sender: Schema.Types.ObjectId,
    documents: [Schema.Types.ObjectId],
    user: Schema.Types.ObjectId
});

var Letter = mongoose.model('Letter', letterSchema);
module.exports = Letter;

