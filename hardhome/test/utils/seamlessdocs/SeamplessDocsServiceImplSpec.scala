package utils.seamlessdocs

import java.net.URL

import com.google.inject.AbstractModule
import com.typesafe.config.ConfigFactory
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.Json
import play.api.mvc.{Action, _}
import play.api.test.{PlaySpecification, WithApplication, WsTestClient}
import play.api.{Application, Configuration}
import play.core.server.Server
import utils.secrets.SecretsManager

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}


case class TestException() extends Exception {

}

trait SeamplessDocsServiceTestContext extends Scope {

  def withTestClient[T](app: Application)(routes: scala.PartialFunction[play.api.mvc.RequestHeader, play.api.mvc.Handler])(block: SeamlessDocsServiceImpl => T): T = {
    Server.withRouter()(routes) { implicit port =>
      WsTestClient.withClient { client =>
        block(
          new SeamlessDocsServiceImpl(client,
            app.injector.instanceOf[Configuration],
            app.injector.instanceOf[SecretsManager])
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
        }
        )({ client: SeamlessDocsServiceImpl =>

          val future: Future[SeamlessApplicationCreateResponse] = client.formPrepare("test", "joe", "joe@email.com", Map())
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
            Results.Ok("""{
                         |"result": true,
                         |"application_id": "AP15021000011409822",
                         |"description": "Submission successful"
                         |}""")
          }
        }
        )({ client: SeamlessDocsServiceImpl =>

          val future: Future[SeamlessApplicationCreateResponse] = client.formPrepare("test", "joe", "joe@email.com", Map())
          future.onComplete {
            case Failure(_) => failure
            case Success(res: SeamlessApplicationCreateResponse) =>
              res.application_id must be equalTo "AP15021000011409822"
              res.description must be equalTo "Submission successful"
              res.result must beTrue
          }
        })
      }
    }
  }

  "fail when endpoint returns unexpected json" in new SeamplessDocsServiceTestContext {
    new WithApplication(application) {
      withTestClient(app)({
        case post if post.method == "POST" && post.uri == "/api/form/test/prepare" => Action {
          Results.Ok("""{
                       |"unexpected": true
                       |}""")
        }
      }
      )({ client: SeamlessDocsServiceImpl =>

        val future: Future[SeamlessApplicationCreateResponse] = client.formPrepare("test", "joe", "joe@email.com", Map())
        future.onComplete {
          case Failure(e) => e must beAnInstanceOf[RuntimeException]
          case Success(_) => failure
        }
      })
    }
  }

  "The SeamplessDocsServiceImpl getInviteUrl method" should {
    "return failure if failed" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)({
          case post if post.method == "GET" && post.uri == "/api/application/test/get_invite_url" => throw TestException()
        }
        )({ client: SeamlessDocsServiceImpl =>

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
          case post if post.method == "POST" && post.uri == "/api/form/test/prepare" => Action {
            Results.Ok("""{
                         |"result": true,
                         |"application_id": "AP15021000011409822",
                         |"description": "Submission successful"
                         |}""")
          }
        }
        )({ client: SeamlessDocsServiceImpl =>

          val future: Future[SeamlessApplicationCreateResponse] = client.formPrepare("test", "joe", "joe@email.com", Map())
          future.onComplete {
            case Failure(_) => failure
            case Success(res: SeamlessApplicationCreateResponse) =>
              res.application_id must be equalTo "AP15021000011409822"
              res.description must be equalTo "Submission successful"
              res.result must beTrue
          }
        })
      }
    }
  }

  "fail when endpoint returns unexpected json" in new SeamplessDocsServiceTestContext {
    new WithApplication(application) {
      withTestClient(app)({
        case post if post.method == "POST" && post.uri == "/api/form/test/prepare" => Action {
          Results.Ok("""{
                       |"unexpected": true
                       |}""")
        }
      }
      )({ client: SeamlessDocsServiceImpl =>

        val future: Future[SeamlessApplicationCreateResponse] = client.formPrepare("test", "joe", "joe@email.com", Map())
        future.onComplete {
          case Failure(e) => e must beAnInstanceOf[RuntimeException]
          case Success(_) => failure
        }
      })
    }
  }
}
