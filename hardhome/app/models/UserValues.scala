package models

import java.util.UUID

import play.api.libs.json.{ JsObject, JsValue, Json, OFormat }

case class UserValues(userID: UUID, values: Map[String, JsValue])

object UserValues {
  implicit val jsonFormat: OFormat[UserValues] = Json.format[UserValues]
}
