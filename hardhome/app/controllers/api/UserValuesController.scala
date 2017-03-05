package controllers.api

import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.UserValues
import models.daos.UserValuesDAO
import play.api.libs.json.{ JsError, JsValue, Json }
import play.api.mvc._
import play.modules.reactivemongo.ReactiveMongoApi
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class UserValuesController @Inject() (
  val reactiveMongoApi: ReactiveMongoApi,
  val userValuesDAO: UserValuesDAO,
  silhouette: Silhouette[DefaultEnv]
) extends Controller {

  def getUserValues: Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        userValuesDAO.find(request.identity.userID).map {
          case found if found.nonEmpty => Ok(Json.toJson(found.get))
          case notFound => NotFound
        }
      }
  }

  def updateUserValues(): Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {
    request =>
      {
        val userValuesResult = request.body.validate[UserValues]

        userValuesResult.fold(
          errors => {
            Future.successful(
              BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors)))
            )
          },
          userValues => {
            userValuesDAO.update(request.identity.userID, userValues).flatMap {
              case ok if ok.ok =>
                userValuesDAO.updateContactInfo(request.identity.userID).flatMap {
                  case userUpdated if userUpdated.nonEmpty && userUpdated.get.ok => Future.successful(
                    Created(Json.obj("status" -> "ok", "message" -> s"User values saved."))
                  )
                  case _ => Future.successful(
                    InternalServerError(Json.obj("status" -> "error", "message" -> "Failed to update user info."))
                  )
                }
              case _ => Future.successful(
                InternalServerError(Json.obj("status" -> "error", "message" -> "Failed to update user values."))
              )
            }
          }
        )
      }
  }

}
