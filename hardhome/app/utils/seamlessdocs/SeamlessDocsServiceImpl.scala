package utils.seamlessdocs

import java.net.URL
import java.time.Clock
import java.util.concurrent.TimeUnit
import javax.inject.Inject

import org.log4s._
import play.api.Configuration
import play.api.http.Status
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.ws.{WSClient, WSRequest, WSResponse}
import retry.Success
import utils.secrets.SecretsManager

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration.Duration

class SeamlessDocsServiceImpl @Inject()(
                                         wsClient: WSClient,
                                         configuration: Configuration,
                                         secretsManager: SecretsManager,
                                         requestUtils: RequestUtils
                                       ) extends SeamlessDocsService {
  private[this] val logger = getLogger

  val url: String = configuration.getString("seamlessdocs.url").get
  lazy val apiSecret: Array[Byte] = secretsManager.getSecret(
    configuration.getString("seamlessdocs.secretKeySecretName").get
  )
  lazy val apiKey: String = secretsManager.getSecretUtf8(
    configuration.getString("seamlessdocs.apiKeySecretName").get
  )

  //lazy val apiSecret: Array[Byte] = configuration.getString("seamlessdocs.secret_key").get.getBytes
  //lazy val apiKey: String = configuration.getString("seamlessdocs.api_key").get

  private def signRequest(request: WSRequest): WSRequest = {
    requestUtils.sign(request, apiKey, apiSecret)
  }

  private def getJsonResponse[T](wsResponse: WSResponse)(implicit rds: play.api.libs.json.Reads[T]): Either[T, SeamlessErrorResponse] = {
    logger.info(s"Seamless Docs Response [${wsResponse.status}]: " + wsResponse.body)
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


  private def executeWithExponentialRetry[T](request: WSRequest)(implicit rds: play.api.libs.json.Reads[T]): Future[Either[T, SeamlessErrorResponse]] = {
    implicit val retryCriteria: Success[Either[T, SeamlessErrorResponse]] =
      Success[Either[T, SeamlessErrorResponse]] {
        case Right(error) if error.error_log.nonEmpty &&
          error.error_log.head.error_code == "rate_limit" => false
        case _ => true
      }

    retry.Backoff(max = 3, delay = Duration(15, TimeUnit.SECONDS))(odelay.Timer.default)(() => {
      request.execute().map(getJsonResponse[T])
    })
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
    val jsonPostWithAnswers: JsValue = jsonPost.deepMerge(JsObject(data))


    executeWithExponentialRetry[SeamlessApplicationCreateResponse](signRequest(
      wsClient
        .url(s"$url/api/form/$formId/prepare")
        .withBody(jsonPostWithAnswers)
        .withMethod("POST")
    ))
  }

  override def formSubmit(
                           formId: String,
                           data: Map[String, JsValue]
                         ): Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] = {
    val jsonPost = Json.obj()
    val jsonPostWithAnswers = jsonPost.deepMerge(JsObject(data))

    executeWithExponentialRetry[SeamlessApplicationCreateResponse](signRequest(
      wsClient
        .url(s"$url/api/form/$formId/prepare")
        .withBody(jsonPostWithAnswers)
        .withMethod("POST")
    ))
  }

  override def getInviteUrl(applicationId: String): Future[URL] = {
    executeWithExponentialRetry[Seq[String]](signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/get_invite_url")
        .withMethod("GET")
    )).map((result: Either[Seq[String], SeamlessErrorResponse]) => {
      result match {
        case Left(urlList) => new URL(urlList.head)
        case Right(error) => throw new RuntimeException(error.toString)
      }
    })
  }

  override def getApplication(applicationId: String): Future[SeamlessApplication] = {
    executeWithExponentialRetry[SeamlessApplication](signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId")
        .withMethod("GET")
    )).map((result: Either[SeamlessApplication, SeamlessErrorResponse]) => {
      result match {
        case Left(application) => application
        case Right(errors) => throw new RuntimeException(errors.toString)
      }
    })
  }

  override def updatePdf(applicationId: String): Future[Either[URL, SeamlessErrorResponse]] = {
    executeWithExponentialRetry[Seq[String]](signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/update_pdf")
        .withBody(JsObject(Seq()))
        .withMethod("POST")
    )).map {
      case Left(urls) => Left(new URL(urls.head))
      case Right(error) => Right(error)
    }
  }

  override def getApplicationStatus(applicationId: String): Future[SeamlessApplicationStatus] = {
    executeWithExponentialRetry[SeamlessApplicationStatus](signRequest(
      wsClient
        .url(s"$url/api/application/$applicationId/status")
        .withMethod("GET")
    )).map((result: Either[SeamlessApplicationStatus, SeamlessErrorResponse]) => {
      result match {
        case Left(seamlessApplicationStatus) => seamlessApplicationStatus
        case Right(error) => throw new RuntimeException(error.toString)
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
    executeWithExponentialRetry[Seq[SeamlessSigner]](signRequest(
      wsClient
        .url(s"$url/api/form/$formId/signers")
        .withMethod("GET")
    ))
      .map((result: Either[Seq[SeamlessSigner], SeamlessErrorResponse]) => {
        result match {
          case Left(signers) => signers
          case Right(error) => throw new RuntimeException(error.toString)
        }
      })
  }
}
