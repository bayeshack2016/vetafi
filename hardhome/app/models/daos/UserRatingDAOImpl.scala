package models.daos

import java.util.UUID
import javax.inject.Inject

import models.{RatingSelection, UserRating}
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.Future


class UserRatingDAOImpl @Inject() (val reactiveMongoApi: ReactiveMongoApi,
                                   val userDAO: UserDAO,
                                  ) extends UserRatingDAO {

  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("ratings"))

  /**
   * Finds current user rating for a user by their userID.
   */
  override def find(userID: UUID): Future[Option[UserRating]] = {
    collection.flatMap {
      _.find(Json.obj("userID" -> userID.toString)).one[UserRating]
    }
  }

  /**
   * Add a new rating selection to the user's saved selections.
   */
  override def addSelection(userID: UUID, selections: Seq[RatingSelection], totalScore: Int): Future[WriteResult] = ???
}
