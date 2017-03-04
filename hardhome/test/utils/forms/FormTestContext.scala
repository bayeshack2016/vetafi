package utils.forms

import com.google.inject.AbstractModule
import com.typesafe.config.ConfigFactory
import models._
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.specification.Scope
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder

trait FormTestContext extends Scope {
  val condition1DependentField = Field(
    "condition1DependentField",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    Some("condition1 === \"x\""),
    optional = false
  )

  val condition2DependentField = Field(
    "condition2DependentField",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    Some("condition2 === \"x\""),
    optional = false
  )

  val requiredField1 = Field(
    "requiredField1",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    None,
    optional = false
  )

  val requiredField2 = Field(
    "requiredField2",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    None,
    optional = false
  )

  val optionalField1 = Field(
    "optionalField1",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    None,
    optional = true
  )

  val optionalField2 = Field(
    "optionalField2",
    Field.TemplateType.input,
    TemplateOptions("test", None, None, None, None),
    None,
    None,
    optional = true
  )

  class FakeFormConfig extends FormConfigManager {
    override def getFormConfigs: Map[String, FormConfig] = Map("test" -> FormConfig(
      "test",
      "Test config.",
      VetafiInfo("test", "Test config.", required = true),
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
