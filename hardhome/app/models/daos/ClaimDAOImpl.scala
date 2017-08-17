package models.daos

import java.time.Instant
import java.util.UUID
import javax.inject.Inject

import models.{ Address, Claim, Recipients }
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import play.modules.reactivemongo.json._
import reactivemongo.api.Cursor
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ClaimDAOImpl @Inject() (val reactiveMongoApi: ReactiveMongoApi) extends ClaimDAO {
  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("claims"))

  def formCollection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("forms"))

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
      Cursor.FailOnError()
    ))
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

  override def findIncompleteClaim(userID: UUID): Future[Option[Claim]] = {
    val query = Json.obj(
      "userID" -> userID,
      "state" -> Claim.State.INCOMPLETE.toString
    )
    collection.flatMap({
      _.find(query).one[Claim]
    })
  }

  override def create(userID: UUID, key: String): Future[WriteResult] = {
    val claim = Claim(
      userID = userID,
      claimID = UUID.randomUUID(),
      key = key,
      Claim.State.INCOMPLETE,
      java.util.Date.from(Instant.now()),
      Recipients(None, None, Seq.empty[String], Seq.empty[Address])
    )

    collection.flatMap(_.insert(claim))
  }

  override def submit(userID: UUID, claimID: UUID): Future[WriteResult] = {
    collection.flatMap(
      _.update(
        Json.obj("userID" -> userID, "claimID" -> claimID),
        Json.obj("$set" -> Json.obj(
          "state" -> Claim.State.SUBMITTED,
          "stateUpdatedAt" -> java.util.Date.from(Instant.now())
        ))
      )
    )
  }

  override def save(userID: UUID, claimID: UUID, claim: Claim): Future[WriteResult] = {
    collection.flatMap(
      _.update(Json.obj("userID" -> userID, "claimID" -> claimID), claim)
    )
  }
}
