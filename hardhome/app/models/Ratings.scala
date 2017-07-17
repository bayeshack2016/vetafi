package models

import play.api.libs.json.{ Format, Json, OFormat }
import utils.EnumUtils

case class RatingCategory(
  description: String,
  subcategories: Seq[RatingCategory],
  diagnostic_code_sets: Seq[DiagnosticCodeSet],
  notes: Seq[RatingNote],
  see_other_notes: Seq[SeeOtherNote]
) {

}

object RatingCategory {
  implicit val jsonFormat: OFormat[RatingCategory] = Json.format[RatingCategory]
}

case class DiagnosticCode(code: Int, description: String) {}

object DiagnosticCode {
  implicit val jsonFormat: OFormat[DiagnosticCode] = Json.format[DiagnosticCode]
}

case class Rating(
  ratings: Seq[Int],
  description: String
) {}

object Rating {
  implicit val jsonFormat: OFormat[Rating] = Json.format[Rating]
}

case class RatingNote(note: String) {}

object RatingNote {
  implicit val jsonFormat: OFormat[RatingNote] = Json.format[RatingNote]
}

case class DiagnosticCodeSet(
  codes: Seq[DiagnosticCode],
  ratings: Seq[Rating],
  notes: Seq[RatingNote]
) {}

object DiagnosticCodeSet {
  implicit val jsonFormat: OFormat[DiagnosticCodeSet] = Json.format[DiagnosticCodeSet]
}

case class SeeOtherNote(see_other_note: String) {}

object SeeOtherNote {
  implicit val jsonFormat: OFormat[SeeOtherNote] = Json.format[SeeOtherNote]
}

case class Condition(diagnosticCode: DiagnosticCode, rating: Int) {}

object Condition {
  implicit val jsonFormat: OFormat[Condition] = Json.format[Condition]
}


case class RatingSelection(rating: Int,
                           diagnosis: DiagnosticCode) {

}

object RatingSelection {
  implicit val jsonFormat: OFormat[RatingSelection] = Json.format[RatingSelection]
}

case class UserRating(ratings: Seq[RatingSelection], total_score: Int) {

}

object UserRating {
  implicit val jsonFormat: OFormat[UserRating] = Json.format[UserRating]
}
