package models

import play.api.libs.json.{ Format, Json, OFormat }
import utils.EnumUtils

case class MailingListSubscription(
  email: String,
  subscriptionType: MailingListSubscription.SubscriptionType.SubscriptionType = MailingListSubscription.SubscriptionType.INTERESTED_IN_UPDATES
) {

}

object MailingListSubscription {

  object SubscriptionType extends Enumeration {
    type SubscriptionType = Value
    val INTERESTED_IN_UPDATES = Value
  }

  implicit val enumFormat: Format[MailingListSubscription.SubscriptionType.Value] =
    EnumUtils.enumFormat(MailingListSubscription.SubscriptionType)

  implicit val jsonFormat: OFormat[MailingListSubscription] = Json.format[MailingListSubscription]
}
