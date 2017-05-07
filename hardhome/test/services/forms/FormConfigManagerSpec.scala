package services.forms

import com.google.inject.AbstractModule
import com.typesafe.config.ConfigFactory
import models.FormConfig
import models.TemplateOptions.AutocompleteType
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.mock.Mockito
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.{ JsValue, Json, Reads }
import play.api.test.{ PlaySpecification, WithApplication }
import play.api.{ Application, Configuration }
import play.modules.reactivemongo.ReactiveMongoApi
import services.FakeReactiveMongoApi
import utils.EnumUtils

import scala.collection.JavaConversions._

trait FormConfigManagerSpecTestContext extends Scope {

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

class FormConfigManagerSpec extends PlaySpecification with Mockito {
  sequential

  "The JsonResourceFormConfigManagerSpec" should {
    "Load enums ok" in new FormConfigManagerSpecTestContext {
      new WithApplication(application) {

        implicit val myEnumReads: Reads[AutocompleteType.Value] = EnumUtils.enumReads(AutocompleteType)

        val jsValue: JsValue = Json.toJson(AutocompleteType.GIVEN_NAME)

        jsValue.toString() must be equalTo "\"given-name\""

        val result = Json.parse("\"given-name\"").validate[AutocompleteType.Value]

        result.isSuccess must beTrue
        result.get must be equalTo AutocompleteType.GIVEN_NAME
      }
    }

    "Load configs without error" in new FormConfigManagerSpecTestContext {
      new WithApplication(application) {
        val formManager: FormConfigManager = app.injector.instanceOf[FormConfigManager]
        val config = ConfigFactory.load("application.test.conf")

        val formConfigs: Map[String, FormConfig] = formManager.getFormConfigs

        formConfigs.keys must be equalTo config.getStringList("forms.enabled")
      }
    }
  }
}
