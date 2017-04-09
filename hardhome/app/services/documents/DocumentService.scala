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
   * Register document with document service.
   *
   * @param form
   * @return
   */
  def create(form: ClaimForm): Future[ClaimForm]

  /**
   * Update document service with new form information and get PDF for document.
   *
   * @param form
   * @return
   */
  def render(form: ClaimForm): Future[Array[Byte]]

  /**
   * Update document service with new form information.
   * @param form
   * @return
   */
  def save(form: ClaimForm): Future[ClaimForm]

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
