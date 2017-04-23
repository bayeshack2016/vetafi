package services.documents

import java.net.URL

import models.ClaimForm

import scala.concurrent.Future
import scala.util.Try

/**
 * Services for creating PDF documents
 */
trait DocumentService {

  /**
   * Get PDF for document from document service.
   *
   * @param form
   * @return
   */
  def render(form: ClaimForm): Future[Array[Byte]]

  /**
   * Submit document to document service for signature.
   * @param form
   * @return
   */
  def submitForSignature(form: ClaimForm): Future[ClaimForm]

  /**
   * Get signature link for document.
   *
   * @param form
   * @return
   */
  def signatureLink(form: ClaimForm): Future[URL]

  /**
   * Get the signature status of the form.
   *
   * @param form
   * @return
   */
  def isSigned(form: ClaimForm): Future[Boolean]
}
