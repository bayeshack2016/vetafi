package services.forms

import com.google.inject.AbstractModule
import com.typesafe.config.ConfigFactory
import models._
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.specification.Scope
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import _root_.services.forms.FormConfigManager

trait FormTestContext extends Scope {
  val condition1DependentField = Field(
    "condition1DependentField",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    Some("model.condition1 === \"x\"")
  )

  val condition2DependentField = Field(
    "condition2DependentField",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    Some("model.condition2 === \"x\"")
  )

  val requiredField1 = Field(
    "requiredField1",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    None
  )

  val requiredField2 = Field(
    "requiredField2",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    None
  )

  val optionalField1 = Field(
    "optionalField1",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None, optional = true),
    None,
    None
  )

  val optionalField2 = Field(
    "optionalField2",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None, optional = true),
    None,
    None
  )

  class FakeFormConfig extends FormConfigManager {
    override def getFormConfigs: Map[String, FormConfig] = Map("test" -> FormConfig(
      "test",
      "Test config.",
      VetafiInfo("test", "Test config.", required = true, externalId = "test", externalSignerId = "test"),
      Seq(condition1DependentField, condition2DependentField,
        requiredField1, requiredField2, optionalField1, optionalField2)
    ))
  }

  /**
   * A fake Guice module.
   */
  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[FormConfigManager].toInstance(new FakeFormConfig())
    }
  }

  lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

object FormTestContext extends FormTestContext
