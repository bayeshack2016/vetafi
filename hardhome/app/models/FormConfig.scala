package models

import play.api.libs.json.{Format, Json, OFormat}
import utils.EnumUtils

/**
  * Case class mapping for json form configuration.
  */
case class FormConfig(
                       name: String,
                       description: String,
                       fields: Seq[Field]
                     ) {

}

object FormConfig {
  implicit val jsonFormat: OFormat[FormConfig] = Json.format[FormConfig]
}


case class VetafiInfo(title: String, summary: String, required: Boolean) {

}

object VetafiInfo {
  implicit val jsonFormat: OFormat[VetafiInfo] = Json.format[VetafiInfo]
}

case class Field(key: String,
                 `type`: Field.TemplateType.Value,
                 templateOptions: TemplateOptions,
                 optionsTypes: Option[Seq[Field.ValidationType.Value]]) {


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

case class TemplateOptions(label: String,
                           autocomplete: Option[TemplateOptions.AutocompleteType.Value],
                           placeHolder: Option[String],
                           rows: Option[Int],
                           columns: Option[Int],
                           optional: Option[Boolean]) {


}

object TemplateOptions {

  object AutocompleteType extends Enumeration {
    type AutocompleteType = Value
    val `name`,
    `honorific-prefix`,
    `given-name`,
    `additional-name`,
    `family-name`,
    `honorific-suffix`,
    `nickname`,
    `username`,
    `new-password`,
    `current-password`,
    `organization-title`,
    `organization`,
    `street-address`,
    `address-line1`,
    `address-line2`,
    `address-line3`,
    `address-level4`,
    `address-level3`,
    `address-level2`,
    `address-level1`,
    `country`,
    `country-name`,
    `postal-code`,
    `cc-name`,
    `cc-given-name`,
    `cc-additional-name`,
    `cc-family-name`,
    `cc-number`,
    `cc-exp`,
    `cc-exp-month`,
    `cc-exp-year`,
    `cc-csc`,
    `cc-type`,
    `language`,
    `bday`,
    `bday-day`,
    `bday-month`,
    `bday-year`,
    `sex`,
    `url`,
    `photo`,
    `tel`,
    `tel-country-code`,
    `tel-national`,
    `tel-area-code`,
    `tel-local`,
    `tel-local-prefix`,
    `tel-local-suffix`,
    `tel-extension`,
    `email`,
    `impp` = Value
  }

  implicit val validationTypeFormat: Format[TemplateOptions.AutocompleteType.Value] = EnumUtils.enumFormat(TemplateOptions.AutocompleteType)
  implicit val jsonFormat: OFormat[TemplateOptions] = Json.format[TemplateOptions]
}

