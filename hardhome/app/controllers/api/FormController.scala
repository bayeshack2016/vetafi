package controllers.api

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.daos.{FormDAO, UserValuesDAO}
import models.{ClaimForm, User}
import play.api.libs.json.{JsError, JsValue, Json}
import play.api.mvc._
import utils.auth.DefaultEnv
import utils.forms.{ClaimService, ContactInfoService}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Controller for CRUD operations on ClaimForms
  */
class FormController @Inject()(
                                val formDAO: FormDAO,
                                val userValuesDAO: UserValuesDAO,
                                val claimService: ClaimService,
                                val contactInfoService: ContactInfoService,
                                silhouette: Silhouette[DefaultEnv]
                              ) extends Controller {

  def getFormsForClaim(claimID: UUID): Action[AnyContent] = silhouette.SecuredAction.async {
    request => {
      formDAO.find(request.identity.userID, claimID).map {
        case forms if forms.nonEmpty => Ok(Json.toJson(forms))
        case _ => NotFound
      }
    }
  }

  def saveForm(claimID: UUID, formKey: String): Action[JsValue] =
    silhouette.SecuredAction.async(BodyParsers.parse.json) {
      request => {
        val dataResult = request.body.validate[Map[String, JsValue]]

        dataResult.fold(
          errors => {
            Future.successful(
              BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors)))
            )
          },
          data => {
            formDAO.find(request.identity.userID, claimID, formKey).flatMap {
              case Some(claimForm) =>
                val formWithProgress: ClaimForm =
                  claimService.calculateProgress(claimForm.copy(responses = data))
                formDAO.save(request.identity.userID, claimID, formKey, formWithProgress).flatMap {
                  case ok if ok.ok => updateUserValues(request.identity, claimForm)
                  case _ => Future.successful(InternalServerError(
                    Json.obj("status" -> "error", "message" -> s"Form not saved.")
                  ))
                }

              case None =>
                Future.successful(NotFound)
            }

          }
        )
      }
    }

  def updateUserValues(identity: User, form: ClaimForm): Future[Result] = {
    userValuesDAO.update(identity.userID, form.responses).flatMap {
      case ok if ok.ok =>
        contactInfoService.updateContactInfo(identity.userID).map {
          case userUpdated if userUpdated.nonEmpty && userUpdated.get.ok =>
            Created(Json.obj("status" -> "ok", "message" -> s"User values saved."))
          case _ =>
            InternalServerError(Json.obj("status" -> "error", "message" -> "Failed to update user info."))
        }
      case _ => Future.successful(
        InternalServerError(Json.obj("status" -> "error", "message" -> "Failed to update user values."))
      )
    }
  }
}
