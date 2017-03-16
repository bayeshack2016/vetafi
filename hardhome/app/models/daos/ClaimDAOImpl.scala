package models.daos

import java.util.UUID
import javax.inject.Inject

import models.{ Address, Claim, ClaimForm, Recipients }
import play.api.libs.json.{ JsValue, Json }
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.Cursor
import reactivemongo.api.commands.{ MultiBulkWriteResult, WriteResult }
import reactivemongo.play.json.collection.JSONCollection
import play.api.libs.json._

import reactivemongo.api._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo._
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

  override def create(userID: UUID, forms: Seq[String]): Future[MultiBulkWriteResult] = {
    val claim = Claim(
      userID = userID,
      claimID = UUID.randomUUID(),
      Claim.State.INCOMPLETE,
      Recipients(None, None, Seq.empty[String], Seq.empty[Address])
    )

    createForms(userID, claim.claimID, forms).flatMap {
      case success if success.ok => collection.flatMap(_.insert(claim)).map(
        (result: WriteResult) => success.merge(result)
      )
      case fail => Future.successful(fail)
    }
  }

  def createForms(userID: UUID, claimID: UUID, forms: Seq[String]): Future[MultiBulkWriteResult] = {
    val formObjects: Seq[ClaimForm] = forms.map((key: String) =>
      ClaimForm(
        key,
        Map.empty[String, JsValue],
        userID,
        claimID,
        0,
        0,
        0,
        0,
        Array.empty[Byte]
      ))

    formCollection.flatMap(
      (coll: JSONCollection) => {
        val documents = formObjects.map(implicitly[coll.ImplicitlyDocumentProducer](_))
        coll.bulkInsert(ordered = false)(documents: _*)
      }
    )
  }

  override def submit(userID: UUID, claimID: UUID): Future[WriteResult] = {
    collection.flatMap(
      _.update(
        Json.obj("userID" -> userID, "claimID" -> claimID),
        Json.obj("$set" -> Json.obj("state" -> Claim.State.SUBMITTED))
      )
    )
  }

  override def save(userID: UUID, claimID: UUID, claim: Claim): Future[WriteResult] = {
    collection.flatMap(
      _.update(Json.obj("userID" -> userID, "claimID" -> claimID), claim))
  }
}
