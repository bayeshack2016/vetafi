package services.documents

import java.net.URL
import javax.inject.Inject

import models.daos.{ FormDAO, UserDAO }
import models.{ ClaimForm, User }
import play.api.http.Status
import play.api.libs.ws.WSClient
import services.forms.FormConfigManager
import utils.seamlessdocs.{ SeamlessAPIError, SeamlessApplicationCreateResponse, SeamlessDocsService, SeamlessErrorResponse }
import org.log4s._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * Document service backed by seamlessdocs
 */
class SeamlessDocsDocumentService @Inject() (
  userDAO: UserDAO,
  formDAO: FormDAO,
  wSClient: WSClient,
  seamlessDocs: SeamlessDocsService,
  formConfigManager: FormConfigManager
) extends DocumentService {

  private[this] val logger = getLogger

  private def updateFormWithApplication(form: ClaimForm, res: SeamlessApplicationCreateResponse): ClaimForm = {
    form.copy(externalApplicationId = Some(res.application_id))
  }

  def setSeamlessDocsFormId(form: ClaimForm): ClaimForm = {
    form.copy(externalFormId = Some(formConfigManager.getFormConfigs(form.key).vfi.externalId))
  }

  private def createApplication(user: User, form: ClaimForm): Future[ClaimForm] = {
    val formWithId = setSeamlessDocsFormId(form)
    seamlessDocs.formPrepare(
      formWithId.externalFormId.get,
      user.name.getOrElse("Unknown User"),
      user.email.get,
      formConfigManager.getFormConfigs(form.key).vfi.externalSignerId,
      formWithId.responses
    ).map {
        case Left(application) =>
          updateFormWithApplication(formWithId, application)
        case Right(error) =>
          throw new RuntimeException("Seamless doc form prepare returned error: " + error.toString)
      }
  }

  private def maybeCreateApplication(form: ClaimForm): Future[ClaimForm] = {
    form.externalApplicationId match {
      case Some(id) => Future.successful(form)
      case None => userDAO.find(form.userID).flatMap {
        case Some(user) => createApplication(user, form).flatMap {
          form =>
            formDAO.save(form.userID, form.claimID, form.key, form).map {
              case ok if ok.ok => form
              case _ => throw new RuntimeException
            }
        }
        case None => throw new RuntimeException
      }
    }
  }

  /**
   * Render form.
   *
   * @param form
   * @return
   */
  override def render(form: ClaimForm): Future[Array[Byte]] = {
    MDC.withCtx(
      "userID" -> form.userID.toString,
      "claimID" -> form.claimID.toString,
      "form" -> form.key
    ) {
        logger.info("render called")
      }
    val formSubmissionFuture: Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] =
      seamlessDocs.formSubmit(form.externalFormId.get, form.responses)

    val updatePdfFuture: Future[Either[URL, SeamlessErrorResponse]] =
      formSubmissionFuture.flatMap {
        case Left(response) => seamlessDocs.updatePdf(response.application_id)
        case Right(_) => throw new RuntimeException
      }

    val pdfUrlFuture: Future[URL] = updatePdfFuture.flatMap {
      // If we get an error response, we already updated the pdf
      case Right(_) =>
        seamlessDocs.getApplication(form.externalApplicationId.get).map(
          application => new URL(application.submission_pdf_url)
        )
      case Left(pdfUrl) => Future.successful(pdfUrl)
    }

    pdfUrlFuture.flatMap(
      pdfUrl => {
        formDAO.save(form.userID, form.claimID, form.key, form.copy()).flatMap {
          case ok if ok.ok => getPdf(pdfUrl)
          case _ => throw new RuntimeException
        }
      }
    )
  }

  /**
   * Assuming the form already has an application ID,
   * get the url of the signed pdf.
   *
   * @param form
   * @return
   */
  override def renderSigned(form: ClaimForm): Future[URL] = {
    MDC.withCtx(
      "userID" -> form.userID.toString,
      "claimID" -> form.claimID.toString,
      "form" -> form.key
    ) {
        logger.info("renderSigned called")

        (form.externalApplicationId match {
          case Some(applicationId) => seamlessDocs.updatePdf(applicationId)
          case None =>
            logger.error("no externalApplicationId present for form provided to renderSigned")
            throw new RuntimeException
        }).map {
          case Left(url) => url
          case Right(_) =>
            logger.warn("update PDF failed in renderSigned")
            throw new RuntimeException
        }
      }
  }

  private[this] def getPdf(pdfUrl: URL): Future[Array[Byte]] = {
    wSClient.url(pdfUrl.toString).get().map(res => {
      res.status match {
        case Status.OK => res.bodyAsBytes.toArray
        case _ => throw new RuntimeException
      }
    })
  }

  /**
   * Submit document to document service for signature.
   *
   * @param form
   * @return
   */
  override def submitForSignature(form: ClaimForm): Future[ClaimForm] = {
    MDC.withCtx(
      "userID" -> form.userID.toString,
      "claimID" -> form.claimID.toString,
      "form" -> form.key
    ) {
        logger.info("submitForSignature called")
      }
    maybeCreateApplication(form).flatMap(updatedForm => {
      seamlessDocs.getInviteUrl(updatedForm.externalApplicationId.get).flatMap {
        url =>
          val formWithSignature: ClaimForm = updatedForm.copy(externalSignatureLink = Some(url.toString))
          formDAO.save(formWithSignature.userID, formWithSignature.claimID, formWithSignature.key, formWithSignature).map {
            case ok if ok.ok => formWithSignature
            case _ => throw new RuntimeException
          }
      }
    })
  }

  /**
   * Get signature link for document
   *
   * @param form
   * @return
   */
  override def signatureLink(form: ClaimForm): Future[URL] = {
    MDC.withCtx(
      "userID" -> form.userID.toString,
      "claimID" -> form.claimID.toString,
      "form" -> form.key
    ) {
        logger.info("signatureLink called")
      }
    maybeCreateApplication(form).flatMap(updatedForm => {
      formDAO.save(updatedForm.userID, updatedForm.claimID, updatedForm.key, updatedForm).flatMap {
        case ok if ok.ok => seamlessDocs.getInviteUrl(updatedForm.externalApplicationId.get)
        case _ => throw new RuntimeException
      }
    })
  }

  /**
   * Get the signature status of the form.
   *
   * @param form
   * @return
   */
  override def isSigned(form: ClaimForm): Future[Boolean] = {
    MDC.withCtx(
      "userID" -> form.userID.toString,
      "claimID" -> form.claimID.toString,
      "form" -> form.key
    ) {
        logger.info("isSigned called")
      }
    seamlessDocs.getApplicationStatus(form.externalApplicationId.get).map {
      status =>
        status.total_signers == status.signatures && status.status == "Complete"
    }
  }
}
