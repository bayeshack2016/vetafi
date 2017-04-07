package models.daos

import java.util.UUID
import javax.inject.Inject

import models.ClaimForm
import models.ClaimForm._
import play.api.libs.json.{ JsNumber, JsObject, JsString, Json }
import play.modules.reactivemongo.ReactiveMongoApi
import play.modules.reactivemongo.json._
import reactivemongo.api._
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * FormDAO backed by MongoDB, via ReactiveMongoApi
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
  override def find(userID: UUID, claimID: UUID, key: String): Future[Option[ClaimForm]] = {
    val query = Json.obj("userID" -> userID, "claimID" -> claimID, "key" -> key)
    collection.flatMap(_.find(query).one[ClaimForm])
  }

  /**
   * Finds all forms for a given user's claim
   *
   * @param userID  The ID of the user.
   * @param claimID The ID of the claim.
   * @return The found user values or None if no user for the given ID combo could be found.
   */
  override def find(userID: UUID, claimID: UUID): Future[Seq[ClaimForm]] = {
    val query = Json.obj("userID" -> userID, "claimID" -> claimID)
    collection.flatMap(_.find(query).cursor[ClaimForm]().foldWhile(Seq.empty[ClaimForm])(
      {
        (agg: Seq[ClaimForm], str: ClaimForm) => Cursor.Cont(agg :+ str)
      },
      Cursor.FailOnError()
    ))
  }

  override def save(userID: UUID, claimID: UUID, key: String, claimForm: ClaimForm): Future[WriteResult] = {
    val query = Json.obj("userID" -> userID, "claimID" -> claimID, "key" -> key)
    collection.flatMap(
      _.update(
        query,
        claimForm,
        upsert = true
      /*
        Json.obj(
          "$set" -> Json.obj(
            "responses" -> JsObject(claimForm.responses),
            "optionalQuestions" -> JsNumber(claimForm.optionalQuestions),
            "requiredQuestions" -> JsNumber(claimForm.requiredQuestions),
            "answeredOptional" -> JsNumber(claimForm.answeredOptional),
            "answeredRequired" -> JsNumber(claimForm.answeredRequired),
            "externalFormId" -> claimForm.externalFormId,
            "externalApplicationId" -> claimForm.externalApplicationId
          )
        )
        */
      )
    )
  }
}
