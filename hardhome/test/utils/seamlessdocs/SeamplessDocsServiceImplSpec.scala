package utils.seamlessdocs

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{Environment, LoginInfo}
import com.mohiva.play.silhouette.test.FakeEnvironment
import com.typesafe.config.ConfigFactory
import controllers.api.ClaimControllerTestContext
import models.{Claim, User}
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.{Matchers, Mockito}
import org.specs2.mock.Mockito
import play.api.{Application, Configuration}
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.JsResult
import play.api.libs.ws.{WSClient, WSRequest}
import play.api.test.{FakeRequest, PlaySpecification, WithApplication}
import utils.auth.DefaultEnv

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.util.Try

trait SeamplessDocsServiceTestContext {

  val mockClient: WSClient = Mockito.mock(classOf[WSClient])
  val mockRequest: WSRequest = Mockito.mock(classOf[WSRequest])

  Mockito.when(mockClient.url(Matchers.any()))
    .thenReturn(mockRequest)

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[WSClient].toInstance(mockClient)
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

  "The SeamplessDocsServiceImpl" should {
    "return failure if failed" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        val service: SeamlessDocsServiceImpl = app.injector.instanceOf[SeamlessDocsServiceImpl]
        Mockito.when(mockRequest.execute()).thenThrow(new RuntimeException("explosion!"))

        val future: Future[Try[SeamlessResponse]] = service.fromPrepare("test", "joe", "joe@email.com", Map())

        val responseTry: Try[SeamlessResponse] = Await.result(future, Duration.Inf)

        responseTry.isFailure must beTrue
      }
    }
  }
}
