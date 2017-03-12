package services.documents

import java.net.URL
import java.util.concurrent.Future

import models.ClaimForm

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


  def validate(form: ClaimForm): Future[Boolean]

}
