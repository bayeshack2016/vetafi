package utils.seamlessdocs

import java.net.URL

import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.util.Try

trait SeamlessDocsService {

  def formPrepare(formId: String, name: String, email: String, data: Map[String, JsValue]): Future[SeamlessApplicationCreateResponse]

  def getInviteUrl(applicationId: String): Future[URL]

  def getApplication(applicationId: String): Future[SeamlessApplication]

  def updatePdf(applicationId: String, data: Map[String, JsValue]): Future[SeamlessResponse]
}
