package utils.secrets

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.Environment
import com.typesafe.config.ConfigFactory
import models.daos.UserDAO
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.mock.Mockito
import org.specs2.specification.Scope
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.test.{ PlaySpecification, WithApplication }
import play.modules.reactivemongo.ReactiveMongoApi
import services.FakeReactiveMongoApi
import utils.auth.DefaultEnv

trait BiscuitSecretsManagerSpecTestContext extends Scope {

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

class BiscuitSecretsManagerSpec extends PlaySpecification with Mockito {
  sequential

  "The BiscuitSecretsManager" should {
    "return unencrypted secret" in new BiscuitSecretsManagerSpecTestContext {
      new WithApplication(application) {
        val secretsManager: SecretsManager = app.injector.instanceOf[SecretsManager]

        val secret = secretsManager.getSecretUtf8("test::secret")

        secret must be equalTo "stuff"
      }
    }
  }
}
