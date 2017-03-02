package models

import play.api.libs.json.{ Json, OFormat }

case class Address(
  name: String,
  street1: String,
  street2: String,
  city: String,
  province: String,
  postal: String,
  country: String
) {
}

object Address {
  implicit val jsonFormat: OFormat[Address] = Json.format[Address]
}
