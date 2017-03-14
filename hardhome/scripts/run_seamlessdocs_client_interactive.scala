import utils.seamlessdocs.SeamlessDocsServiceImpl
import play.api.inject.guice.GuiceApplicationBuilder
import utils.secrets.SecretsManager
import play.api.Configuration
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext.Implicits.global

val conf = Configuration.from(Map("seamlessdocs.url" -> "https://vetafi.seamlessdocs.com"))


class FakeSecretManager extends SecretsManager {

    val seamlessdocs_secret_key =  "<fill>"
    val seamlessdocs_api_key = "<fill>"

    override def getSecret(name: String): Array[Byte] = {
        name match {
              case "seamlessdocs_secret_key" => seamlessdocs_secret_key.getBytes()
              case "seamlessdocs_api_key" => seamlessdocs_api_key.getBytes()
        }
    }

    override def getSecretUtf8(name: String): String = {
        name match {
              case "seamlessdocs_secret_key" => seamlessdocs_secret_key
              case "seamlessdocs_api_key" => seamlessdocs_api_key
        }
    }
}

val app = GuiceApplicationBuilder().build()

val client = new SeamlessDocsServiceImpl(app.injector.instanceOf[WSClient], conf, new FakeSecretManager())
