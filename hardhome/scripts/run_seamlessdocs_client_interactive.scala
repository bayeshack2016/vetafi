import utils.seamlessdocs.SeamlessDocsServiceImpl
import play.api.inject.guice.GuiceApplicationBuilder
import utils.secrets.SecretsManager
import play.api.Configuration
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext.Implicits.global
import com.typesafe.config.ConfigFactory

val config = Configuration(ConfigFactory.load("application.prod.conf"))
val app = GuiceApplicationBuilder(configuration = config).build()
val client = new SeamlessDocsServiceImpl(app.injector.instanceOf[WSClient], app.configuration, app.injector.instanceOf[SecretsManager])
