package utils.seamlessdocs

import java.net.URL
import javax.inject.Inject

import play.api.Configuration
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import utils.secrets.SecretsManager

import scala.concurrent.Future
import scala.util.control.NonFatal
import scala.util.parsing.json.JSONObject
import scala.util.{Failure, Success, Try}

import scala.concurrent.ExecutionContext.Implicits.global

class SeamlessDocsServiceImpl @Inject()(wsClient: WSClient,
                                        configuration: Configuration,
                                        secretsManager: SecretsManager) extends SeamlessDocsService {

  val url: String = configuration.getString("seamlessdocs.url").get
  lazy val apiSecret: Array[Byte] = secretsManager.getSecret("seamlessdocs_secret_key")
  lazy val apiKey: String = secretsManager.getSecretUtf8("seamlessdocs_api_key")

  private def signRequest(request: WSRequest): WSRequest = {
    RequestUtils.sign(request, apiKey, apiSecret)
  }

  /**
    * {
    * "legal_name": "John Doe",
    * "birth_date": "June 2, 1978",
    * "gender": "Male",
    * "signer_data": {
    * "fullname": "City Clerk",
    * "email":"preparer@example.com"
    * },
    * "recipients": {
    * "71f0d6844867a206d837f6728ddb545b": {
    * "fullname": "John Doe",
    * "email": "johndoe@example.com"
    * }
    * }
    * @param formId
    * @param name
    * @param email
    * @param data
    * @return
    */
  override def fromPrepare(formId: String,
                           name: String,
                           email: String,
                           data: Map[String, JsValue]): Future[Try[SeamlessResponse]] = {
    val jsonPost = Json.obj("recipients" ->
      Json.obj("prepared_for" ->
        Json.obj("fullname" -> name, "email" -> email)
      )
    )
    val jsonPostWithAnswers = jsonPost.deepMerge(JsObject(data))

    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/prepare")
        .withBody(jsonPostWithAnswers)
        .withMethod("POST"))
      .execute()
      .map((wsResponse: WSResponse) => {
        val validate = wsResponse.json.validate[SeamlessResponse]
        validate.fold(
          errors => {
            Failure(new RuntimeException(errors.toString()))
          },
          seamlessResponse => {
            Success(seamlessResponse)
          }
        )
      })

  }

  override def getInviteUrl(applicationId: String): Future[Try[URL]] = {
    signRequest(
      wsClient
        .url(s"$url/api/form/$applicationId/prepare")
        .withMethod("GET"))
      .get()
      .map((wsResponse: WSResponse) => {
        try {
          Success(new URL(wsResponse.body))
        } catch {
          case NonFatal(e) => Failure(e)
        }
      })
  }

  override def getApplication(applicationId: String): Future[Try[SeamlessApplication]] = {
    signRequest(
      wsClient
        .url(s"$url/api/form/$applicationId")
        .withMethod("GET"))
      .get()
      .map((wsResponse: WSResponse) => {
        val validate = wsResponse.json.validate[SeamlessApplication]
        validate.fold(
          errors => {
            Failure(new RuntimeException(errors.toString()))
          },
          seamlessApplication => {
            Success(seamlessApplication)
          }
        )
      })
  }

  override def updatePdf(applicationId: String, data: Map[String, JsValue]): Future[Try[SeamlessResponse]] = {
    signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/update_pdf")
        .withBody(JsObject(data))
        .withMethod("POST"))
      .execute()
      .map((wsResponse: WSResponse) => {
        val validate = wsResponse.json.validate[SeamlessResponse]
        validate.fold(
          errors => {
            Failure(new RuntimeException(errors.toString()))
          },
          seamlessResponse => {
            Success(seamlessResponse)
          }
        )
      })
  }
}
