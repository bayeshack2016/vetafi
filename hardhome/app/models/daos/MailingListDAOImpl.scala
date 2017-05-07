package models.daos
import javax.inject.Inject

import models.MailingListSubscription
import models.MailingListSubscription.SubscriptionType.SubscriptionType
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

class MailingListDAOImpl @Inject() (
  val reactiveMongoApi: ReactiveMongoApi
) extends MailingListDAO {

  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("mailing_list"))

  override def save(
    email: String,
    subscriptionType: SubscriptionType = MailingListSubscription.SubscriptionType.INTERESTED_IN_UPDATES
  ): Future[WriteResult] = {
    collection.flatMap(_.insert(MailingListSubscription(email, subscriptionType)))
  }
}
