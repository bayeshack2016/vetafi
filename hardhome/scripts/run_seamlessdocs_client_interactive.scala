import utils.seamlessdocs.SeamlessDocsServiceImpl
import play.api.inject.guice.GuiceApplicationBuilder
import utils.secrets.SecretsManager
import play.api.Configuration
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext.Implicits.global


val app = GuiceApplicationBuilder().build()
val client = new SeamlessDocsServiceImpl(app.injector.instanceOf[WSClient], app.configuration, app.injector.instanceOf[SecretsManager])
