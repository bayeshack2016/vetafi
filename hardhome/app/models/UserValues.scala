package models

import java.util.UUID

import play.api.libs.json.Json

case class UserValues(userID: UUID, values: Map[String, String])

object UserValues {
  implicit val jsonFormat = Json.format[UserValues]
}
