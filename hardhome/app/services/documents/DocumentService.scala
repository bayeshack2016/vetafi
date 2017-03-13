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
   * Get PDF for document.
   *
   * @param form
   * @return
   */
  def render(form: ClaimForm): Future[Array[Byte]]

  /**
   * Get signature link for document
   *
   * @param form
   * @return
   */
  def signatureLink(form: ClaimForm): Future[URL]
}
