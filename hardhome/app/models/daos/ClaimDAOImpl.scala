package models.daos

import java.util.UUID
import javax.inject.Inject

import models.Claim
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.Cursor
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.Future


class ClaimDAOImpl @Inject()(val reactiveMongoApi: ReactiveMongoApi) extends ClaimDAO {
  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("claims"))

  /**
    * Finds user's claims
    *
    * @param userID The ID of the user.
    * @return The found user values or None if no user for the given ID combo could be found.
    */
  override def findClaims(userID: UUID): Future[Seq[Claim]] = {
    val query = Json.obj("userID" -> userID)
    collection.flatMap(_.find(query).cursor[Claim]().foldWhile(Seq.empty[Claim])(
      {
        (agg: Seq[Claim], str: Claim) => Cursor.Cont(agg :+ str)
      },
      Cursor.FailOnError()))
  }

  /**
    * Finds user's claim
    *
    * @param userID The ID of the user.
    * @return The found user values or None if no user for the given ID combo could be found.
    */
  override def findClaim(userID: UUID, claimID: UUID): Future[Option[Claim]] = {
    val query = Json.obj("userID" -> userID, "claimID" -> claimID)
    collection.flatMap(_.find(query).one[Claim])
  }

  override def create(userID: UUID, forms: Seq[String]): Future[WriteResult] = {
    collection.flatMap(_.insert[Claim](claim))
  }
}
