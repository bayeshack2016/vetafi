var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userAddressSchema = new Schema({
    user: Schema.Types.ObjectId,
    name: String, // Name line
    addressLine1: String,
    addressLine2: String,
    addressCity: String,
    addressState: String,
    addressZip: String,
    addressCountry: String
});

var UserAddress = mongoose.model('UserAddress', userAddressSchema);
module.exports = UserAddress;
