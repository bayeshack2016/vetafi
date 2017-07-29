package controllers.api

import javax.inject.Inject

import com.mohiva.play.silhouette.api.{ Identity, LoginInfo, Silhouette }
import models.{ ClaimForm, User, UserValues }
import models.daos.UserValuesDAO
import play.api.Logger
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
        userValuesDAO.find(request.identity.userID).flatMap {
          case Some(userValues) =>
            Logger.logger.info(s"GET user/values for ${request.identity.userID}")
            Future.successful(Ok(Json.toJson(userValues)))
          case None =>
            Logger.logger.info(s"Initializing user values for ${request.identity.userID}")
            userValuesDAO.initialize(request.identity.userID).flatMap {
              case ok if ok.ok => userValuesDAO.find(request.identity.userID).map {
                case Some(newUserValues) => Ok(Json.toJson(newUserValues))
                case None => InternalServerError
              }
            }
        }
      }
  }
}
