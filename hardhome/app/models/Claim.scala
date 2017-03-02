package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.json.{Json, OFormat}

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


case class Address(name: String,
                   street1: String,
                   street2: String,
                   city: String,
                   province: String,
                   postal: String,
                   country: String) {
}

object Address {
  implicit val jsonFormat: OFormat[Address] = Json.format[Address]
}


case class Recipients(emails: Seq[String],
                      addresses: Seq[Address]) {
}

object Recipients {
  implicit val jsonFormat: OFormat[Recipients] = Json.format[Recipients]
}


/**
  * A claim represents 1 or more Forms grouped together for submission.
  */
case class Claim(userID: UUID,
                 state: String,
                 stateUpdatedAt: DateTime,
                 sentTo: Recipients) {

}

object Claim {
  implicit val jsonFormat: OFormat[Claim] = Json.format[Claim]
}
