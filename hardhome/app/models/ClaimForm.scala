package models

import java.net.URL
import java.util.UUID

import play.api.libs.json._

/**
 * Represents a single completed piece of paperwork.
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
  externalFormId: Option[String] = None,
  externalApplicationId: Option[String] = None,
  externalSignatureLink: Option[String] = None,
  isSigned: Boolean = false
) {

}

object ClaimForm {
  implicit val jsonFormat: OFormat[ClaimForm] = Json.format[ClaimForm]
}
