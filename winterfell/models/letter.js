var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var letterSchema = new Schema({
    id: String,
    document: Buffer,
    name: String, // Name line
    createdAt: Date,
    expectedDeliveryDate: Date,
    recipiant: String,
    sender: String,
    form: String,
    addressState: String,
    addressZip: String,
    addressCountry: String
});

var Letter = mongoose.model('Letter', letterSchema);
module.exports = Letter;

