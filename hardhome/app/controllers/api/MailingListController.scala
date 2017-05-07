package controllers.api

import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.MailingListSubscription
import models.daos.MailingListDAO
import play.api.Logger
import play.api.libs.json.{ JsError, JsValue, Json }
import play.api.mvc.{ Action, BodyParsers, Controller }
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class MailingListController @Inject() (
  val mailingListDAO: MailingListDAO,
  silhouette: Silhouette[DefaultEnv]
) extends Controller {

  def subscribe(): Action[JsValue] = silhouette.UnsecuredAction.async(BodyParsers.parse.json) {
    request =>
      {
        Logger.info("/api/subscribe got: " + request.body)
        val mailingListSubscriptionResult = request.body.validate[MailingListSubscription]
        mailingListSubscriptionResult.fold(
          errors => {
            Future.successful(BadRequest(Json.obj(
              "status" -> "error", "message" -> JsError.toJson(errors)
            )))
          },
          subscription => {
            mailingListDAO.save(subscription.email).flatMap {
              case ok if ok.ok =>
                Future.successful(Ok(Json.obj(
                  "status" -> "success", "message" -> "Subscription successful."
                )))
              case _ =>
                Future.successful(InternalServerError(Json.obj(
                  "status" -> "error", "message" -> "Subscription failed, database error."
                )))
            }
          }
        )
      }
  }
}
