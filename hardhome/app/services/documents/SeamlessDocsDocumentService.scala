package services.documents

import java.net.URL
import javax.inject.Inject

import models.daos.{ FormDAO, UserDAO }
import models.{ ClaimForm, User }
import play.api.http.Status
import play.api.libs.ws.{ WSClient, WSResponse }
import utils.seamlessdocs.{ SeamlessApplicationCreateResponse, SeamlessDocsService, SeamlessDocsServiceImpl }

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

/**
 * Document service backed by seamlessdocs
 */
class SeamlessDocsDocumentService @Inject() (
  userDAO: UserDAO,
  formDAO: FormDAO,
  wSClient: WSClient,
  seamlessDocs: SeamlessDocsService
) extends DocumentService {

  private def updateFormWithApplication(form: ClaimForm)(res: SeamlessApplicationCreateResponse): ClaimForm = {
    form.copy(externalApplicationId = Some(res.application_id))
  }

  def setSeamlessDocsFormId(form: ClaimForm): ClaimForm = {
    form.copy(externalFormId = Some("CO17021000023901967"))
  }

  private def createApplication(user: User, form: ClaimForm): Future[ClaimForm] = {
    val formWithId = setSeamlessDocsFormId(form)
    seamlessDocs.formPrepare(
      formWithId.externalFormId.get,
      user.fullName.getOrElse("Unknown Unknown"),
      user.email.get,
      formWithId.responses
    ).map(updateFormWithApplication(formWithId))
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
    val pdfUrlFuture: Future[URL] =
      seamlessDocs.updatePdf(form.externalApplicationId.get, form.responses)

    val pdfFuture: Future[Array[Byte]] = pdfUrlFuture.flatMap(
      pdfUrl => {
        wSClient.url(pdfUrl.toString).get().map(res => {
          res.status match {
            case Status.OK => res.bodyAsBytes.toArray
            case _ => throw new RuntimeException
          }
        })
      }
    )

    pdfFuture.flatMap(
      pdf => {
        formDAO.save(form.userID, form.claimID, form.key, form.copy(pdf = pdf)).map {
          case ok if ok.ok => pdf
          case _ => throw new RuntimeException
        }
      }
    )
  }

  /**
   * Get signature link for document
   *
   * @param form
   * @return
   */
  override def signatureLink(form: ClaimForm): Future[URL] = {
    maybeCreateApplication(form).flatMap(updatedForm => {
      formDAO.save(updatedForm.userID, updatedForm.claimID, updatedForm.key, updatedForm).flatMap {
        case ok if ok.ok => seamlessDocs.getInviteUrl(updatedForm.externalApplicationId.get)
        case _ => throw new RuntimeException
      }
    })
  }

  /**
   * Register document with document service.
   *
   * @param form
   * @return
   */
  override def create(form: ClaimForm): Future[ClaimForm] = {
    maybeCreateApplication(form)
  }

  /**
   * Update document service with new form information.
   *
   * @param form
   * @return
   */
  override def save(form: ClaimForm): Future[ClaimForm] = {
    seamlessDocs.updatePdf(form.externalApplicationId.get, form.responses).map(
      _ => form
    )
  }

  /**
   * Get the signature status of the form.
   *
   * @param form
   * @return
   */
  override def isSigned(form: ClaimForm): Future[Boolean] = {
    seamlessDocs.getApplicationStatus(form.externalApplicationId.get).map {
      status =>
        status.total_signers == status.signatures && status.status == "Complete"
    }
  }
}
