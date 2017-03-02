package models.daos

import java.util.UUID
import javax.inject.Inject

import models.{Form, User}
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.Future

/**
  * Created by jeffquinn on 3/2/17.
  */
class FormDAOImpl @Inject() (val reactiveMongoApi: ReactiveMongoApi) extends FormDAO {

  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("forms"))

  /**
    * Finds form for a given user's claim
    *
    * @param userID  The ID of the user.
    * @param claimID The ID of the claim.
    * @param key     The codename of the form
    * @return The found user values or None if no user for the given ID combo could be found.
    */
  override def find(userID: UUID, claimID: UUID, key: String): Future[Option[Form]] = {
    val query = Json.obj("userID" -> userID, "claimID" -> claimID, "key" -> key)
    collection.flatMap(_.find(query).one[Form])
  }
}
