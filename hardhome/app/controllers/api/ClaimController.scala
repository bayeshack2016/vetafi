package controllers.api

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.User
import models.daos.{ ClaimDAO, UserDAO }
import play.api.libs.json.{ JsError, JsValue, Json }
import play.api.mvc.{ Action, AnyContent, BodyParsers, Controller }
import play.modules.reactivemongo.ReactiveMongoApi
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.json._

import scala.concurrent.Future

/**
 * API endpoint for CRUD operations on claims.
 */
class ClaimController @Inject() (
  val claimDAO: ClaimDAO,
  silhouette: Silhouette[DefaultEnv]
) extends Controller {

  def getClaim(claimID: UUID): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        claimDAO.findClaim(request.identity.userID, claimID).map {
          case Some(claim) => Ok(Json.toJson(claim))
          case None => NotFound
        }
      }
  }

  def create: Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {
    request =>
      {
        val formKeySeqResult = request.body.validate[Seq[String]]
        formKeySeqResult.fold(
          errors => {
            Future.successful(BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors))))
          },
          formKeys => {
            claimDAO.findIncompleteClaim(request.identity.userID).flatMap {
              case Some(claim) => Future.successful(Ok(Json.obj(
                "status" -> "ok",
                "message" -> "Claim already exists."
              )))
              case None => claimDAO.create(request.identity.userID, formKeys).map {
                case ok if ok.ok => Created(Json.obj(
                  "status" -> "ok",
                  "message" -> "Created new claim."
                ))
                case fail => InternalServerError(Json.obj(
                  "status" -> "error",
                  "message" -> fail.errmsg.getOrElse("Unknown database error.").toString
                ))
              }
            }
          }
        )
      }
  }
}
