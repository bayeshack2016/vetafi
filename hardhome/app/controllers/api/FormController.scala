package controllers.api

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.daos.{ FormDAO, UserValuesDAO }
import models.{ ClaimForm, User }
import play.api.Logger
import play.api.libs.json.{ JsBoolean, JsError, JsValue, Json }
import play.api.mvc._
import services.documents.DocumentService
import services.forms.{ ClaimService, ContactInfoService }
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * Controller for CRUD operations on ClaimForms
 */
class FormController @Inject() (
  val formDAO: FormDAO,
  val userValuesDAO: UserValuesDAO,
  val claimService: ClaimService,
  val contactInfoService: ContactInfoService,
  val documentService: DocumentService,
  silhouette: Silhouette[DefaultEnv]
) extends Controller {

  def getFormsForClaim(claimID: UUID): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        formDAO.find(request.identity.userID, claimID).map {
          case forms if forms.nonEmpty => Ok(Json.toJson(forms))
          case _ => NotFound
        }
      }
  }

  def getForm(claimID: UUID, formKey: String): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        formDAO.find(request.identity.userID, claimID, formKey).map {
          case Some(form) => Ok(Json.toJson(form))
          case _ => NotFound
        }
      }
  }

  def saveForm(claimID: UUID, formKey: String): Action[JsValue] =
    silhouette.SecuredAction.async(BodyParsers.parse.json) {
      request =>
        {
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

                  (for {
                    formSaveFuture <- formDAO.save(request.identity.userID, claimID, formKey, formWithProgress)
                    updateUserValuesFuture <- updateUserValues(request.identity, data)
                  } yield {
                    Created(Json.obj("status" -> "ok"))
                  }).recover {
                    case _: RuntimeException => InternalServerError
                  }

                case None =>
                  Future.successful(NotFound)
              }
            }
          )
        }
    }

  def getFormSignatureStatus(claimID: UUID, formKey: String): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      formDAO.find(request.identity.userID, claimID, formKey).flatMap {
        case Some(claimForm) =>
          documentService.isSigned(claimForm).flatMap {
            isSigned =>
              formDAO.save(request.identity.userID, claimID, formKey, claimForm.copy(isSigned = isSigned)).map {
                _ => Ok(JsBoolean(isSigned))
              }
          }
        case None =>
          Future.successful(NotFound)
      }
  }

  def getPdf(claimID: UUID, formKey: String): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      formDAO.find(request.identity.userID, claimID, formKey).flatMap {
        case Some(claimForm) =>
          documentService.render(claimForm).map {
            content =>
              Ok(content).as("application/pdf").withCookies(
                Cookie("fileDownloadToken", "1", secure = false, httpOnly = false)
              )
          }
        case None =>
          Future.successful(NotFound)
      }
  }

  def pdfLoadingScreen(): Action[AnyContent] = Action {
    request =>
      Ok("Please wait while your document is being generated...")
  }

  def updateUserValues(identity: User, values: Map[String, JsValue]): Future[Unit] = {
    Logger.logger.info(s"updateUserValues called with $values")
    userValuesDAO.update(identity.userID, values).flatMap {
      case ok if ok.ok =>
        contactInfoService.updateContactInfo(identity.userID).map {
          case userUpdated if userUpdated.nonEmpty && userUpdated.get.ok =>
            Nil
          case _ =>
            throw new RuntimeException("Failed to update user info.")
        }
      case _ => Future.successful(
        throw new RuntimeException("Failed to update user values.")
      )
    }
  }
}
