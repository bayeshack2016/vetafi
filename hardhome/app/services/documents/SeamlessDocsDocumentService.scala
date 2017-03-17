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

  private def createApplication(user: User, form: ClaimForm): Future[ClaimForm] = {
    seamlessDocs.formPrepare(
      form.externalFormId.get,
      user.fullName.get,
      user.email.get,
      form.responses
    ).map(updateFormWithApplication(form))
  }

  private def maybeCreateApplication(form: ClaimForm): Future[ClaimForm] = {
    form.externalApplicationId match {
      case Some(id) => Future.successful(form)
      case None => userDAO.find(form.userID).flatMap {
        case Some(user) => createApplication(user, form)
        case None => throw new RuntimeException
      }
    }
  }

  /**
   * Get PDF for document.
   *
   * @param form
   * @return
   */
  override def render(form: ClaimForm): Future[Array[Byte]] = {
    val pdfUrlFuture: Future[URL] = maybeCreateApplication(form).flatMap(updatedForm => {
      seamlessDocs.updatePdf(updatedForm.externalApplicationId.get, updatedForm.responses)
    })

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
}
