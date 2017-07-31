package controllers.api

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.daos.{ ClaimDAO, FormDAO }
import models.{ Claim, ClaimForm, Recipients, StartClaimRequest }
import play.api.libs.json.{ JsError, JsValue, Json }
import play.api.mvc.{ Action, _ }
import services.documents.DocumentService
import services.forms.{ ClaimService, FormConfigManager }
import services.submission.SubmissionService
import utils.auth.DefaultEnv
import org.log4s._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * API endpoint for CRUD operations on claims.
 */
class ClaimController @Inject() (
  val claimDAO: ClaimDAO,
  val formDAO: FormDAO,
  val claimService: ClaimService,
  val documentService: DocumentService,
  val formConfigManager: FormConfigManager,
  silhouette: Silhouette[DefaultEnv],
  submissionService: SubmissionService
) extends Controller {

  private[this] val logger = getLogger

  def getClaims: Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        claimDAO.findClaims(request.identity.userID).map(
          claims => Ok(Json.toJson(claims))
        )
      }
  }

  def getClaim(claimID: UUID): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        claimDAO.findClaim(request.identity.userID, claimID).map {
          case Some(claim) => Ok(Json.toJson(claim))
          case None => NotFound
        }
      }
  }

  private def createForms(userID: UUID, claimID: UUID, forms: Seq[String]): Future[Seq[Boolean]] = {
    val futures = forms.map((key: String) => {
      val newForm = claimService.calculateProgress(ClaimForm(
        key,
        Map.empty[String, JsValue],
        userID,
        claimID,
        0,
        0,
        0,
        0,
        externalFormId = Some(formConfigManager.getFormConfigs(key).vfi.externalId)
      ))

      for {
        formSaveFuture <- formDAO.save(userID, claimID, key, newForm)
      } yield {
        true
      }

    })

    Future.sequence(futures)
  }

  def create: Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {
    request =>
      {
        val formKeySeqResult = request.body.validate[StartClaimRequest]
        formKeySeqResult.fold(
          errors => {
            Future.successful(BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors))))
          },
          startClaimRequest => {
            claimDAO.findIncompleteClaim(request.identity.userID).flatMap {
              case Some(claim) => Future.successful(Ok(Json.toJson(claim)))
              case None => claimDAO.create(request.identity.userID, startClaimRequest.key).flatMap {
                case ok if ok.ok => claimDAO.findIncompleteClaim(request.identity.userID).flatMap {
                  case Some(claim) => createForms(claim.userID, claim.claimID, startClaimRequest.forms).map {
                    _ =>
                      MDC.withCtx(
                        "userID" -> claim.userID.toString,
                        "claimID" -> claim.claimID.toString,
                        "claimKey" -> claim.key
                      ) {
                          logger.info(s"Created new claim: $claim")
                        }
                      Created(Json.toJson(claim))
                  }
                  case None => Future.successful(InternalServerError(Json.obj(
                    "status" -> "error"
                  )))
                }
                case _ => Future.successful(InternalServerError(Json.obj(
                  "status" -> "error"
                )))
              }
            }
          }
        )
      }
  }

  def findUpdateAndSubmitClaim(claim: Claim, recipients: Recipients): Future[Result] = {
    claimDAO.save(claim.userID, claim.claimID, claim.copy(sentTo = recipients)).flatMap {
      case updateRecipients if updateRecipients.ok => submissionService.submit(claim).flatMap {
        case success if success.success =>
          claimDAO.submit(claim.userID, claim.claimID).flatMap {
            case submitted if submitted.ok => Future.successful(Ok(Json.obj("status" -> "ok")))
            case _ => Future.successful(InternalServerError)
          }
        case fail =>
          Future.successful(InternalServerError(
            Json.obj(
              "status" -> "error",
              "message" -> fail.message
            )
          ))
      }
      case _ => Future.successful(InternalServerError)
    }
  }

  def sign(claimID: UUID): Action[AnyContent] = silhouette.SecuredAction.async {
    request =>
      {
        formDAO.find(request.identity.userID, claimID).flatMap {
          forms =>
            Future.sequence(forms.map(documentService.submitForSignature))
        }.map {
          _ => Ok
        }
      }
  }

  def submit(claimID: UUID): Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {
    request =>
      {
        val recipientsResult = request.body.validate[Recipients]
        recipientsResult.fold(
          errors => {
            Future.successful(BadRequest(Json.obj("status" -> "error", "message" -> JsError.toJson(errors))))
          },
          recipients => {
            claimDAO.findClaim(request.identity.userID, claimID).flatMap {
              case Some(claim) =>
                if (claim.state == Claim.State.INCOMPLETE) {
                  findUpdateAndSubmitClaim(claim, recipients)
                } else {
                  Future.successful(InternalServerError)
                }
              case None => Future.successful(NotFound)
            }
          }
        )
      }
  }
}
