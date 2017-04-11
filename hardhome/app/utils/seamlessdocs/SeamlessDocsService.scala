package utils.seamlessdocs

import java.net.URL

import play.api.libs.json.JsValue

import scala.concurrent.Future

trait SeamlessDocsService {

  def formPrepare(formId: String, name: String, email: String, data: Map[String, JsValue]): Future[SeamlessApplicationCreateResponse]

  def formSubmit(formId: String, data: Map[String, JsValue]): Future[JsValue]

  def getInviteUrl(applicationId: String): Future[URL]

  def getApplication(applicationId: String): Future[SeamlessApplication]

  def getApplicationStatus(applicationId: String): Future[SeamlessApplicationStatus]

  def updatePdf(applicationId: String, data: Map[String, JsValue]): Future[URL]

  def getForms: Future[JsValue]

  def getFormElements(formId: String): Future[JsValue]

  def getFormProperties(formId: String): Future[JsValue]

  def getFormSigners(formId: String): Future[Seq[SeamlessSigner]]
}
