'use strict';
var _ = require('lodash');
var FormProps = require('../utils/formProperties');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FormSchema = new Schema({
  _id: String,
  title: String,                    // Readable title of Form
  summmary: String,                 // Short summary of Form
  full_description: String,         // More detailed description of Form
  fields: [String],                 // Array of "form fields" that Form contains
  required_fields: [String],        // Array of "form fields" that Form requires
  required: Boolean                 // Is form required for every claim?
});

// Query helpers (none)
// Instance methods (none)

// Static methods
var allForms = [
  {
    // _id: FormProps.INTENT_TO_FILE_CLAIM,
    title: 'Intent to File a Claim',
    summary: 'This form notifies the VA of your intent to file for general benefits.',
    description: 'By completing an application within one year of filing this form, your completed application will be considered filed on the date the VA received this form. Your benefit effective start date may be able to start earlier.',
    fields: [FormProps.FIRST_NAME, FormProps.MIDDLE_INITIAL, FormProps.LAST_NAME, FormProps.SSN, FormProps.DATE_OF_BIRTH, FormProps.GENDER, FormProps.ADDRESS_LINE_1, FormProps.ADDRESS_LINE_2, FormProps.ADDRESS_CITY, FormProps.ADDRESS_STATE, FormProps.ADDRESS_ZIP, FormProps.ADDRESS_COUNTRY, FormProps.PHONE_NUMBER, FormProps.EMAIL],
    required_fields: _.without(this.fields, FormProps.MIDDLE_INITIAL, FormProps.ADDRESS_LINE_2, FormProps.ADDRESS_STATE, FormProps.ADDRESS_ZIP, FormProps.EMAIL),
    required: true
  }
];

FormSchema.statics.saveAllForms = function() {
  for(var i = 0; i < allForms.length; i++) {
    var form = allForms[i];
    Form.create({
      _id: form._id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      required_fields: form.required_fields,
      required: form.required
    });
  }
};

var Form = mongoose.model('Form', FormSchema);
module.exports = Form;
