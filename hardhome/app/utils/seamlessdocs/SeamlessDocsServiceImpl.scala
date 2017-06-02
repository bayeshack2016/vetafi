package utils.seamlessdocs

import java.net.URL
import java.time.Clock
import javax.inject.Inject

import play.Logger
import play.api.{ Configuration, Environment }
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
  lazy val apiSecret: Array[Byte] = secretsManager.getSecret(
    configuration.getString("seamlessdocs.secretKeySecretName").get
  )
  lazy val apiKey: String = secretsManager.getSecretUtf8(
    configuration.getString("seamlessdocs.apiKeySecretName").get
  )

  // lazy val apiSecret: Array[Byte] = configuration.getString("seamlessdocs.secret_key").get.getBytes
  // lazy val apiKey: String = configuration.getString("seamlessdocs.api_key").get
  lazy val requestUtils: RequestUtils = new RequestUtils(Clock.systemUTC())

  private def signRequest(request: WSRequest): WSRequest = {
    requestUtils.sign(request, apiKey, apiSecret)
  }

  private def getJsonResponse[T](wsResponse: WSResponse)(implicit rds: play.api.libs.json.Reads[T]): Either[T, SeamlessErrorResponse] = {
    Logger.info(s"Seamless Docs Response [${wsResponse.status}]: " + wsResponse.body)
    wsResponse.status match {
      case Status.OK =>
        val validateApiError = wsResponse.json.validate[SeamlessErrorResponse]
        validateApiError.fold(
          _ => {
            val validateExpected = wsResponse.json.validate[T]
            validateExpected.fold(
              errors => {
                throw new RuntimeException(
                  s"Encountered JSON parsing errors: ${errors.toString} " +
                    s"when parsing body: ${wsResponse.body}"
                )
              },
              success => {
                Left(success)
              }
            )
          },
          success => {
            Right(success)
          }
        )
      case unexpectedStatus: Int => throw new RuntimeException(
        s"Encountered unexpected status ($unexpectedStatus): " + wsResponse.body
      )
    }
  }

  override def formPrepare(
    formId: String,
    name: String,
    email: String,
    signerId: String,
    data: Map[String, JsValue]
  ): Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] = {
    val jsonPost = Json.obj(
      "signer_data" -> Json.obj(
        "fullname" -> "Vetafi",
        "email" -> "admin@vetafi.org"
      ),
      "recipients" -> Json.obj(
        signerId -> Json.obj(
          "fullname" -> name,
          "email" -> email
        )
      )
    )
    val jsonPostWithAnswers = jsonPost.deepMerge(JsObject(data))

    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/prepare")
        .withBody(jsonPostWithAnswers)
        .withMethod("POST")
    )
      .execute()
      .map(getJsonResponse[SeamlessApplicationCreateResponse])
  }

  override def formSubmit(
    formId: String,
    data: Map[String, JsValue]
  ): Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] = {
    val jsonPost = Json.obj()
    val jsonPostWithAnswers = jsonPost.deepMerge(JsObject(data))

    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/prepare")
        .withBody(jsonPostWithAnswers)
        .withMethod("POST")
    )
      .execute()
      .map(getJsonResponse[SeamlessApplicationCreateResponse])
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

  override def updatePdf(applicationId: String): Future[Either[URL, SeamlessErrorResponse]] = {
    signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/update_pdf")
        .withBody(JsObject(Seq()))
        .withMethod("POST")
    )
      .execute()
      .map(getJsonResponse[Seq[String]])
      .map {
        case Left(urls) => Left(new URL(urls.head))
        case Right(error) => Right(error)
      }
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

  override def getForms: Future[JsValue] = {
    signRequest(
      wsClient
        .url(s"$url/api/account/forms")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK => wsResponse.json
          case _ => throw new RuntimeException(wsResponse.body)
        }
      })
  }

  override def getFormElements(formId: String): Future[JsValue] = {
    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/elements")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK => wsResponse.json
          case _ => throw new RuntimeException(wsResponse.body)
        }
      })
  }

  override def getFormProperties(formId: String): Future[JsValue] = {
    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/properties")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK => wsResponse.json
          case _ => throw new RuntimeException(wsResponse.body)
        }
      })
  }

  override def getFormSigners(formId: String): Future[Seq[SeamlessSigner]] = {
    signRequest(
      wsClient
        .url(s"$url/api/form/$formId/signers")
        .withMethod("GET")
    )
      .get()
      .map((wsResponse: WSResponse) => {
        wsResponse.status match {
          case Status.OK =>
            val validate = wsResponse.json.validate[Seq[SeamlessSigner]]
            validate.fold(
              errors => {
                throw new RuntimeException(
                  s"Encountered JSON parsing errors: ${errors.toString} " +
                    s"when parsing body: ${wsResponse.body}"
                )
              },
              signers => {
                signers
              }
            )
          case _ => throw new RuntimeException(wsResponse.body)
        }
      })
  }
}
