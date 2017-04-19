package models

import java.util.UUID

import play.api.libs.json.{ Format, Json, OFormat }
import utils.EnumUtils

/*var ClaimSchema = new Schema({
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User'
},
state: String,         // Claim.State
stateUpdatedAt: Date,  // Date of last state modification
sentTo: {
emails: [String],
addresses: [AddressSchema]
}
}, {
timestamps: true
});

var State = {
INCOMPLETE: 'incomplete',
DISCARDED: 'discarded',
SUBMITTED: 'submitted',
PROCESSED: 'processed'
};

var addressSchema = new Schema({
  name: String,                   // Name of Address (Home) (optional)
  street1: String,                // Street name & number
  street2: String,                // Secondary Address (Suite, Apt, Room, P.O.)
  city: String,                   // City
  province: String,               // Province or U.S. State
  postal: String,                 // Postal or U.S. Zip Code
  country: String                 // Country
}, {minimize: false, timestamps: false});

*/

case class Recipients(
  toAddress: Option[Address],
  fromAddress: Option[Address],
  emails: Seq[String],
  addresses: Seq[Address]
) {
}

object Recipients {
  implicit val jsonFormat: OFormat[Recipients] = Json.format[Recipients]
}

/**
 * A claim represents 1 or more Forms grouped together for submission.
 */
case class Claim(
  userID: UUID,
  claimID: UUID,
  state: Claim.State.Value,
  stateUpdatedAt: java.util.Date,
  sentTo: Recipients
) {

}

object Claim {

  object State extends Enumeration {
    type State = Value
    val INCOMPLETE, SIGNING, DISCARDED, SUBMITTED, PROCESSED = Value
  }

  implicit val enumFormat: Format[Claim.State.Value] = EnumUtils.enumFormat(Claim.State)

  implicit val jsonFormat: OFormat[Claim] = Json.format[Claim]
}

case class ClaimSubmission(
  externalId: String,
  success: Boolean,
  message: Option[String],
  dateSubmitted: java.util.Date
) {

}

object ClaimSubmission {
  implicit val jsonFormat: OFormat[ClaimSubmission] = Json.format[ClaimSubmission]
}
