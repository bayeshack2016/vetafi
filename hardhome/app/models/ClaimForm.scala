package models

import java.util.UUID

import play.api.libs.json._

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
  pdf: Array[Byte],
  // for seamlessdocs
  externalFormId: Option[String] = None,
  externalApplicationId: Option[String] = None
) {

}

object ClaimForm {
  implicit val jsonFormat: OFormat[ClaimForm] = Json.format[ClaimForm]
}
