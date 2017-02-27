package utils.secrets

import com.typesafe.config.ConfigFactory
import modules.JobModule
import org.specs2.mock.Mockito
import play.api.Configuration
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.test.{ PlaySpecification, WithApplication }

class BiscuitSecretsManagerSpec extends PlaySpecification with Mockito {
  sequential

  "The BiscuitSecretsManager" should {
    "return unencrypted secret" in new WithApplication(GuiceApplicationBuilder()
      .configure(Configuration(ConfigFactory.load("application.test.conf")))
      .disable(classOf[JobModule])
      .build()) {
      val secretsManager: SecretsManager = app.injector.instanceOf[SecretsManager]

      val secret = secretsManager.getSecretUtf8("test::secret")

      secret must be equalTo "stuff"
    }
  }
}
