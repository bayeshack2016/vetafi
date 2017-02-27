package controllers.api

import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.User
import models.daos.UserDAO
import play.api.libs.json.{ JsError, JsValue, Json }
import play.api.mvc.{ Action, AnyContent, BodyParsers, Controller }
import play.modules.reactivemongo.ReactiveMongoApi
import utils.auth.DefaultEnv
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

/**
 * API endpoint for User objects
 */
class UserController @Inject() (
  val reactiveMongoApi: ReactiveMongoApi,
  val userDao: UserDAO,
  silhouette: Silhouette[DefaultEnv]
) extends Controller {

  def getUser: Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        Future.successful(Ok(Json.toJson(request.identity)))
      }
  }

  def updateUser(): Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {

    request =>
      {
        val userResult = request.body.validate[User]

        userResult.fold(
          errors => {
            Future.successful(BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors))))
          },
          user => {
            userDao.updateContactInfo(user).flatMap {
              case ok if ok.ok => Future.successful(Ok(Json.obj("status" -> "ok", "message" -> ("User '" + user.name + "' saved."))))
              case error => Future.successful(InternalServerError(Json.obj("status" -> "error")))
            }
          }
        )
      }
  }

  def deleteUser(): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        userDao.setInactive(request.identity).flatMap {
          case ok if ok.ok => Future.successful(Ok(Json.obj("status" -> "ok", "message" -> ("User '" + request.identity.userID + "' inactivated."))))
          case error => Future.successful(InternalServerError(Json.obj("status" -> "error")))
        }
      }
  }
}
