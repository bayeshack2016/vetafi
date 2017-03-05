package models

import play.api.libs.json.{ Json, OFormat }

case class Address(
  name: Option[String] = None,
  street1: Option[String] = None,
  street2: Option[String] = None,
  city: Option[String] = None,
  province: Option[String] = None,
  postal: Option[String] = None,
  country: Option[String] = None
) {
}

object Address {
  implicit val jsonFormat: OFormat[Address] = Json.format[Address]
}
