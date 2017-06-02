package utils.seamlessdocs

import java.net.URL

import com.google.inject.AbstractModule
import com.typesafe.config.ConfigFactory
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.mvc.{ Action, _ }
import play.api.test.{ PlaySpecification, WithApplication, WsTestClient }
import play.api.{ Application, Configuration, Environment }
import play.core.server.Server
import play.modules.reactivemongo.ReactiveMongoApi
import services.FakeReactiveMongoApi
import utils.secrets.SecretsManager

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{ Failure, Success }

case class TestException() extends Exception {

}

trait SeamplessDocsServiceTestContext extends Scope {

  def withTestClient[T](app: Application)(routes: scala.PartialFunction[play.api.mvc.RequestHeader, play.api.mvc.Handler])(block: SeamlessDocsServiceImpl => T): T = {
    Server.withRouter()(routes) { implicit port =>
      WsTestClient.withClient { client =>
        block(
          new SeamlessDocsServiceImpl(
            client,
            app.injector.instanceOf[Configuration],
            app.injector.instanceOf[SecretsManager]
          )
        )
      }
    }
  }

  class FakeSecretManager extends SecretsManager {
    override def getSecret(name: String): Array[Byte] = {
      "secret".getBytes
    }

    override def getSecretUtf8(name: String): String = {
      "secret"
    }
  }

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[SecretsManager].toInstance(new FakeSecretManager)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

class SeamplessDocsServiceImplSpec extends PlaySpecification {
  sequential

  "The SeamplessDocsServiceImpl formPrepare method" should {
    "return failure if failed" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri == "/api/form/test/prepare" => throw TestException()
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] =
            client.formPrepare("test", "joe", "joe@email.com", "signer", Map())
          future.onComplete {
            case Failure(e) => e must beAnInstanceOf[TestException]
            case Success(_) => failure
          }
        })
      }
    }

    "succeed when endpoint returns expected json" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri == "/api/form/test/prepare" => Action {
            Results.Ok(
              """{
                |"result": true,
                |"application_id": "AP15021000011409822",
                |"description": "Submission successful"
                |}"""
            )
          }
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] =
            client.formPrepare("test", "joe", "joe@email.com", "signer", Map())
          future.onComplete {
            case Failure(_) => failure
            case Success(Left(res: SeamlessApplicationCreateResponse)) =>
              res.application_id must be equalTo "AP15021000011409822"
              res.description must be equalTo "Submission successful"
              res.result must beTrue
          }
        })
      }
    }

    "fail when endpoint returns unexpected json" in new SeamplessDocsServiceTestContext {
      new WithApplication(
        application
      ) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri ==
            "/api/form/test/prepare" => Action {
            Results.Ok(
              """{
                |"unexpected": true
                |}"""
            )
          }
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[Either[SeamlessApplicationCreateResponse, SeamlessErrorResponse]] =
            client.formPrepare("test", "joe", "joe@email.com", "signer", Map())
          future.onComplete {
            case Failure(e) => e must
              beAnInstanceOf[RuntimeException]
            case Success(_) => failure
          }
        })
      }
    }
  }

  "The SeamplessDocsServiceImpl getInviteUrl method" should {
    "return failure if failed" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "GET" && post.uri == "/api/application/test/get_invite_url" => throw TestException()
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[URL] = client.getInviteUrl("test")
          future.onComplete {
            case Failure(e) => e must beAnInstanceOf[TestException]
            case Success(_) => failure
          }
        })
      }
    }

    "succeed when endpoint returns expected json" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri == "/api/application/test/get_invite_url" => Action {
            Results.Ok("""["https://www.website.com"]""")
          }
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[URL] = client.getInviteUrl("test")
          future.onComplete {
            case Failure(_) => failure
            case Success(res: URL) =>
              res.toString must be equalTo "https://www.website.com"
          }
        })
      }
    }

    "fail when endpoint returns bad url" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri == "/api/application/test/get_invite_url" => Action {
            Results.Ok("""["----!!!hi!"]""")
          }
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[URL] = client.getInviteUrl("test")
          future.onComplete {
            case Failure(e) => e must beAnInstanceOf[RuntimeException]
            case Success(_) => failure
          }
        })
      }
    }

    "fail when endpoint returns unexpected json" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri == "/api/application/test/get_invite_url" => Action {
            Results.Ok(
              """{
                |"unexpected": true
                |}"""
            )
          }
        })({ client: SeamlessDocsServiceImpl =>

          val future: Future[URL] = client.getInviteUrl("test")
          future.onComplete {
            case Failure(e) => e must beAnInstanceOf[RuntimeException]
            case Success(_) => failure
          }
        })
      }
    }
  }

  "The SeamplessDocsServiceImpl getApplication method" should {
    "succeed when endpoint returns expected json" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "GET" && post.uri == "/api/application/test" => Action {
            Results.Ok("""{
                 |    "modified_ts": "2017-02-20 14:38:21",
                 |    "created_ts": "2017-02-20 14:38:13",
                 |    "application_id": "AP17021000023902251",
                 |    "form_id": "CO17021000023901967",
                 |    "user_id": null,
                 |    "notes": null,
                 |    "is_active": "t",
                 |    "application_data": null,
                 |    "pdf_cloud_file_id": null,
                 |    "user_agent_xml": {
                 |        "platform": "Mac OS X",
                 |        "browser": "Chrome",
                 |        "version": "56.0.2924.87",
                 |        "mobile": null,
                 |        "robot": null,
                 |        "is_mobile": null,
                 |        "string": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
                 |    },
                 |    "geo_data_xml": {
                 |        "ip_address": "63.248.210.242"
                 |    },
                 |    "referrer_url": "",
                 |    "ip_address": "63.248.210.242",
                 |    "submission_pdf_url": "https://cdn.seamlessdocs.com/sig_files/xxx.pdf",
                 |    "field_positions_xml": [],
                 |    "group_id": null,
                 |    "overrides_xml": [],
                 |    "submission_file_urls": [
                 |        "https://cdn.seamlessdocs.com/sig_files/xxx.pdf"
                 |    ],
                 |    "is_incomplete": "f"
                 |}""")
          }
        })({ client: SeamlessDocsServiceImpl =>
          val future: Future[SeamlessApplication] = client.getApplication("test")
          future.onComplete {
            case Failure(_) => failure
            case Success(res: SeamlessApplication) =>
              res.submission_pdf_url must be equalTo "https://cdn.seamlessdocs.com/sig_files/xxx.pdf"
          }
        })
      }
    }
  }

  "The SeamplessDocsServiceImpl updatePdf method" should {
    "succeed when endpoint returns expected json" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "POST" && post.uri == "/api/application/test/update_pdf" => Action {
            Results.Ok("""["https://www.website.com"]""")
          }
        })({ client: SeamlessDocsServiceImpl =>
          val future: Future[Either[URL, SeamlessErrorResponse]] = client.updatePdf("test")
          future.onComplete {
            case Failure(_) => failure
            case Success(Left(res: URL)) =>
              res.toString must be equalTo "https://www.website.com"
          }
        })
      }
    }
  }
}
