package controllers.api

import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.User
import models.daos.{ ClaimDAO, UserDAO }
import play.api.libs.json.{ JsError, JsValue, Json }
import play.api.mvc.{ Action, AnyContent, BodyParsers, Controller }
import play.modules.reactivemongo.ReactiveMongoApi
import utils.auth.DefaultEnv

import scala.concurrent.Future

/**
 * Created by jeffquinn on 3/2/17.
 */
class ClaimController @Inject() (
  val reactiveMongoApi: ReactiveMongoApi,
  val claimDAO: ClaimDAO,
  silhouette: Silhouette[DefaultEnv]
) extends Controller {

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
              case claim if claim.nonEmpty => Future.successful(Ok(Json.obj(
                "status" -> "ok",
                "message" -> "Claim already exists."
              )))
              case noClaim => claimDAO.create(request.identity.userID, formKeys).map {
                case ok if ok.ok => Created(Json.obj(
                  "status" -> "ok",
                  "message" -> "Created new claim."
                ))
                case fail => InternalServerError(Json.obj(
                  "status" -> "error",
                  "message" -> fail.errmsg.getOrElse("Unknown database error.")
                ))
              }
            }
          }
        )
      }
  }
}
