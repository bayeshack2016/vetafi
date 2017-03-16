package controllers.api

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api.Silhouette
import models.daos.ClaimDAO
import models.{Claim, ClaimSubmission, Recipients}
import play.api.libs.json.{JsError, JsValue, Json}
import play.api.mvc._
import services.submission.SubmissionService
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * API endpoint for CRUD operations on claims.
  */
class ClaimController @Inject()(
                                 val claimDAO: ClaimDAO,
                                 silhouette: Silhouette[DefaultEnv],
                                 submissionService: SubmissionService
                               ) extends Controller {

  def getClaims: Action[AnyContent] = silhouette.SecuredAction.async {
    request => {
      claimDAO.findClaims(request.identity.userID).map {
        case claims if claims.nonEmpty => Ok(Json.toJson(claims))
        case _ => NotFound
      }
    }
  }

  def getClaim(claimID: UUID): Action[AnyContent] = silhouette.SecuredAction.async {
    request => {
      claimDAO.findClaim(request.identity.userID, claimID).map {
        case Some(claim) => Ok(Json.toJson(claim))
        case None => NotFound
      }
    }
  }

  def create: Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {
    request => {
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

  def findUpdateAndSubmitClaim(claim: Claim, recipients: Recipients): Future[Result] = {
    claimDAO.save(claim.userID, claim.claimID, claim.copy(sentTo = recipients)).flatMap {
      case updateRecipients if updateRecipients.ok => submissionService.submit(claim).flatMap {
        submission: ClaimSubmission =>
          claimDAO.submit(claim.userID, claim.claimID).flatMap {
            case submitted if submitted.ok => Future.successful(Ok(Json.obj("status" -> "ok")))
            case _ => Future.successful(InternalServerError())
          }
      }
      case _ => Future.successful(InternalServerError())
    }
  }

  def submit(claimID: UUID): Action[JsValue] = silhouette.SecuredAction.async(BodyParsers.parse.json) {
    request => {
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
                Future.successful(InternalServerError())
              }
            case None => Future.successful(NotFound())
          }
        }
      )
    }
  }
}
