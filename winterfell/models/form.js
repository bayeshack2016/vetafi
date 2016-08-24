var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Represent the set of responses for a single form.
 */
var formSchema = new Schema({
  key: String, // Code name for the form
  responses: Schema.Types.Mixed,
  user: Schema.Types.ObjectId,
  claim: Schema.Types.ObjectId
}, {
  timestamps: true
});

formSchema.index({ key: 1, user: 1, claim: 1 }, {unique: true});

var Form = mongoose.model('Form', formSchema);
module.exports = Form;
