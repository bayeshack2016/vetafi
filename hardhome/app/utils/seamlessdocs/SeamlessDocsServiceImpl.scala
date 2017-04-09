package utils.seamlessdocs

import java.net.URL
import java.time.Clock
import javax.inject.Inject

import play.api.Configuration
import play.api.http.Status
import play.api.libs.json.{ JsObject, JsValue, Json }
import play.api.libs.ws.{ WSClient, WSRequest, WSResponse }
import utils.secrets.SecretsManager

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class SeamlessDocsServiceImpl @Inject() (
  wsClient: WSClient,
  configuration: Configuration,
  secretsManager: SecretsManager
) extends SeamlessDocsService {

  val url: String = configuration.getString("seamlessdocs.url").get
  // lazy val apiSecret: Array[Byte] = secretsManager.getSecret("seamlessdocs_secret_key")
  // lazy val apiKey: String = secretsManager.getSecretUtf8("seamlessdocs_api_key")

  lazy val apiSecret: Array[Byte] = configuration.getString("seamlessdocs.secret_key").get.getBytes
  lazy val apiKey: String = configuration.getString("seamlessdocs.api_key").get
  lazy val requestUtils: RequestUtils = new RequestUtils(Clock.systemUTC())

  private def signRequest(request: WSRequest): WSRequest = {
    requestUtils.sign(request, apiKey, apiSecret)
  }

  override def formPrepare(
    formId: String,
    name: String,
    email: String,
    data: Map[String, JsValue]
  ): Future[SeamlessApplicationCreateResponse] = {
    val jsonPost = Json.obj( //"recipients" ->
    //Json.obj(
    // "prepared_for" ->
    // Json.obj("fullname" -> name, "email" -> email))
    )
    val jsonPostWithAnswers = jsonPost.deepMerge(JsObject(data))

    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/prepare")
        .withBody(jsonPostWithAnswers)
        .withMethod("POST")
    )
      .execute()
      .map((wsResponse: WSResponse) => {
        val validate = wsResponse.json.validate[SeamlessApplicationCreateResponse]
        validate.fold(
          errors => {
            throw new RuntimeException(errors.toString())
          },
          seamlessResponse => {
            seamlessResponse
          }
        )
      })

  }

  override def getInviteUrl(applicationId: String): Future[URL] = {
    signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/get_invite_url")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK =>
            val validate = wsResponse.json.validate[Seq[String]]
            validate.fold(
              errors => {
                throw new RuntimeException(errors.toString())
              },
              urlList => {
                new URL(urlList.head)
              }
            )
          case _ => throw new RuntimeException(wsResponse.body)
        }
      })
  }

  override def getApplication(applicationId: String): Future[SeamlessApplication] = {
    signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK =>
            val validate = wsResponse.json.validate[SeamlessApplication]
            validate.fold(
              errors => {
                throw new RuntimeException(
                  s"Encountered JSON parsing errors: ${errors.toString} " +
                    s"when parsing body: ${wsResponse.body}"
                )
              },
              seamlessApplication => {
                seamlessApplication
              }
            )
          case _ => throw new RuntimeException(wsResponse.body)
        }

      })
  }

  override def updatePdf(applicationId: String, data: Map[String, JsValue]): Future[URL] = {
    signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/update_pdf")
        .withBody(JsObject(data))
        .withMethod("POST")
    )
      .execute()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK =>
            val validate = wsResponse.json.validate[Seq[String]]
            validate.fold(
              errors => {
                throw new RuntimeException(
                  s"Encountered JSON parsing errors: ${errors.toString} " +
                    s"when parsing body: ${wsResponse.body}"
                )
              },
              urlList => {
                new URL(urlList.head)
              }
            )
          case _ => throw new RuntimeException(wsResponse.body)
        }
      })
  }

  override def getApplicationStatus(applicationId: String): Future[SeamlessApplicationStatus] = {
    signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/status")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK =>
            val validate = wsResponse.json.validate[SeamlessApplicationStatus]
            validate.fold(
              errors => {
                throw new RuntimeException(
                  s"Encountered JSON parsing errors: ${errors.toString} " +
                    s"when parsing body: ${wsResponse.body}"
                )
              },
              seamlessApplication => {
                seamlessApplication
              }
            )
          case _ => throw new RuntimeException(wsResponse.body)
        }

      })
  }
}
