function FormProperties(app) {
    this.app = app;
}

module.exports = FormProperties;

module.exports.FORM_ID = {
  INTENT_TO_FILE_CLAIM: 'vba_21_0966_are'
};

/* Veteran's full first name */
module.exports.FIRST_NAME = "field_first_name";

/* Veteran's full middle name */
module.exports.MIDDLE_NAME = "field_middle_name";

/* Veteran's middle initial */
module.exports.MIDDLE_INITIAL = "field_middle_initial";

/* Veteran's full last name */
module.exports.LAST_NAME = "field_last_name";

/* Veteran's social security number */
module.exports.SSN = "field_ssn";

/* Veteran's date of birth */
module.exports.DATE_OF_BIRTH = "field_date_of_birth";

/* Veteran's gender */
module.exports.GENDER = "field_gender";

/* Veteran's address line 1 (number and street) */
module.exports.ADDRESS_LINE_1 = "field_address_line_1";

/* Veteran's address line 2 (PO Box, Suite, Apt, etc.) */
module.exports.ADDRESS_LINE_2 = "field_address_line_2";

/* City of veteran address */
module.exports.ADDRESS_CITY = "field_address_city";

/* State of veteran address */
module.exports.ADDRESS_STATE = "field_address_state";

/* Zipcode of veteran address */
module.exports.ADDRESS_ZIP = "field_address_zip";

/* Country of veteran address */
module.exports.ADDRESS_COUNTRY = "field_address_country";

/* Veteran's contact phone number */
module.exports.PHONE_NUMBER = "field_veteran_phone_number";

/* Veteran's contact email */
module.exports.EMAIL = "field_veteran_email";
