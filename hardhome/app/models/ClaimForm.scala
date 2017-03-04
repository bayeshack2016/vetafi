package models

import java.util.UUID

import play.api.libs.json.{ JsValue, Json, OFormat }

/**
 * Represents a single completed piece of paperwork.
 *
 * TODO: MongoDB document size limit is 16MB,
 * we might need another way to store the pdf.
 */
case class ClaimForm(
  key: String,
  responses: Map[String, JsValue],
  userID: UUID,
  claimID: UUID,
  optionalQuestions: Int,
  requiredQuestions: Int,
  answeredRequired: Int,
  answeredOptional: Int,
  pdf: Array[Byte]
) {

}

object ClaimForm {
  implicit val jsonFormat: OFormat[ClaimForm] = Json.format[ClaimForm]
}
