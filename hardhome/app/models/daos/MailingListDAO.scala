package models.daos

import models.MailingListSubscription
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait MailingListDAO {
  def save(
    email: String,
    subscriptionType: MailingListSubscription.SubscriptionType.SubscriptionType = MailingListSubscription.SubscriptionType.INTERESTED_IN_UPDATES
  ): Future[WriteResult]
}
