package utils.seamlessdocs

import com.google.inject.AbstractModule
import com.typesafe.config.ConfigFactory
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.{Matchers, Mockito}
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.ws.{WSClient, WSRequest}
import play.api.test.{PlaySpecification, WithApplication}
import play.api.{Application, Configuration}
import utils.secrets.SecretsManager

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.util.Try

trait SeamplessDocsServiceTestContext extends Scope {

  val mockClient: WSClient = Mockito.mock(classOf[WSClient])
  val mockRequest: WSRequest = Mockito.mock(classOf[WSRequest])

  Mockito.when(mockClient.url(Matchers.any()))
    .thenReturn(mockRequest)

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
      bind[WSClient].toInstance(mockClient)
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

  "The SeamplessDocsServiceImpl" should {
    "return failure if failed" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        val service: SeamlessDocsServiceImpl = app.injector.instanceOf[SeamlessDocsServiceImpl]
        Mockito.when(mockRequest.execute()).thenThrow(new RuntimeException("explosion!"))

        val future: Future[SeamlessApplicationCreateResponse] = service.formPrepare("test", "joe", "joe@email.com", Map())

        val responseTry: SeamlessApplicationCreateResponse = Await.result(future, Duration.Inf)
      }
    }
  }
}
