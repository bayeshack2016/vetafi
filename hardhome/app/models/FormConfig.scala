package models

import play.api.libs.json.{ Format, Json, OFormat }
import utils.EnumUtils

/**
 * Case class mapping for json form configuration.
 */
case class FormConfig(
  name: String,
  description: String,
  vfi: VetafiInfo,
  fields: Seq[Field]
) {

}

object FormConfig {
  implicit val jsonFormat: OFormat[FormConfig] = Json.format[FormConfig]
}

case class VetafiInfo(title: String, summary: String, required: Boolean, externalId: String) {

}

object VetafiInfo {
  implicit val jsonFormat: OFormat[VetafiInfo] = Json.format[VetafiInfo]
}

case class Field(
  key: String,
  `type`: Field.TemplateType.Value,
  templateOptions: TemplateOptions,
  optionsTypes: Option[Seq[Field.ValidationType.Value]],
  hideExpression: Option[String]
) {

}

object Field {

  object TemplateType extends Enumeration {
    type TemplateType = Value
    val radio, input, textarea = Value
  }

  object ValidationType extends Enumeration {
    type ValidationType = Value
    val email, date, state, country, zipCode, phoneNumber, ssn = Value
  }

  implicit val templateTypeFormat: Format[Field.TemplateType.Value] = EnumUtils.enumFormat(Field.TemplateType)
  implicit val validationTypeFormat: Format[Field.ValidationType.Value] = EnumUtils.enumFormat(Field.ValidationType)
  implicit val jsonFormat: OFormat[Field] = Json.format[Field]

}

case class TemplateOptions(
  label: String,
  autocomplete: Option[TemplateOptions.AutocompleteType.Value],
  placeHolder: Option[String],
  rows: Option[Int],
  columns: Option[Int],
  optional: Boolean = false
) {

}

object TemplateOptions {

  object AutocompleteType extends Enumeration {
    type AutocompleteType = Value
    val name = Value("name")
    val HONORIFIC_PREFIX = Value("honorific-prefix")
    val GIVEN_NAME = Value("given-name")
    val ADDITIONAL_NAME = Value("additional-name")
    val FAMILY_NAME = Value("family-name")
    val HONORIFIC_SUFFIX = Value("honorific-suffix")
    val NICKNAME = Value("nickname")
    val USERNAME = Value("username")
    val NEW_PASSWORD = Value("new-password")
    val CURRENT_PASSWORD = Value("current-password")
    val ORGANIZATION_TITLE = Value("organization-title")
    val ORGANIZATION = Value("organization")
    val STREET_ADDRESS = Value("street-address")
    val ADDRESS_LINE1 = Value("address-line1")
    val ADDRESS_LINE2 = Value("address-line2")
    val ADDRESS_LINE3 = Value("address-line3")
    val ADDRESS_LEVEL4 = Value("address-level4")
    val ADDRESS_LEVEL3 = Value("address-level3")
    val ADDRESS_LEVEL2 = Value("address-level2")
    val ADDRESS_LEVEL1 = Value("address-level1")
    val COUNTRY = Value("country")
    val COUNTRY_NAME = Value("country-name")
    val POSTAL_CODE = Value("postal-code")
    val CC_NAME = Value("cc-name")
    val CC_GIVEN_NAME = Value("cc-given-name")
    val CC_ADDITIONAL_NAME = Value("cc-additional-name")
    val CC_FAMILY_NAME = Value("cc-family-name")
    val CC_NUMBER = Value("cc-number")
    val CC_EXP = Value("cc-exp")
    val CC_EXP_MONTH = Value("cc-exp-month")
    val CC_EXP_YEAR = Value("cc-exp-year")
    val CC_CSC = Value("cc-csc")
    val CC_TYPE = Value("cc-type")
    val LANGUAGE = Value("language")
    val BDAY = Value("bday")
    val BDAY_DAY = Value("bday-day")
    val BDAY_MONTH = Value("bday-month")
    val BDAY_YEAR = Value("bday-year")
    val SEX = Value("sex")
    val URL = Value("url")
    val PHOTO = Value("photo")
    val TEL = Value("tel")
    val TEL_COUNTRY_CODE = Value("tel-country-code")
    val TEL_NATIONAL = Value("tel-national")
    val TEL_AREA_CODE = Value("tel-area-code")
    val TEL_LOCAL = Value("tel-local")
    val TEL_LOCAL_PREFIX = Value("tel-local-prefix")
    val TEL_LOCAL_SUFFIX = Value("tel-local-suffix")
    val TEL_EXTENSION = Value("tel-extension")
    val EMAIL = Value("email")
    val IMPP = Value("impp")
  }

  implicit val validationTypeFormat: Format[TemplateOptions.AutocompleteType.Value] = EnumUtils.enumFormat(TemplateOptions.AutocompleteType)
  implicit val jsonFormat: OFormat[TemplateOptions] = Json.format[TemplateOptions]
}

