package utils.forms

import java.util.UUID

import com.typesafe.config.ConfigFactory
import models.{ ClaimForm, Field, TemplateOptions }
import modules.JobModule
import org.specs2.mock.Mockito
import play.api.Configuration
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.JsString
import play.api.test.{ PlaySpecification, WithApplication }

class ClaimServiceSpec extends PlaySpecification with Mockito {
  sequential

  "The ClaimServiceImpl" should {

    "evaluate hide expressions correctly" in new WithApplication(GuiceApplicationBuilder()
      .configure(Configuration(ConfigFactory.load("application.test.conf")))
      .disable(classOf[JobModule])
      .build()) {

      val claimService: ClaimServiceImpl = app.injector.instanceOf[ClaimServiceImpl]

      claimService.shouldBeAnswered(Map("condition" -> JsString("x")))(
        Field(
          "test",
          Field.TemplateType.input,
          TemplateOptions("test", None, None, None, None),
          None,
          Some("condition === \"x\"")
        )
      ) must beTrue

      claimService.shouldBeAnswered(Map("condition" -> JsString("y")))(
        Field(
          "test",
          Field.TemplateType.input,
          TemplateOptions("test", None, None, None, None),
          None,
          Some("condition === \"x\"")
        )
      ) must beFalse
    }
  }

  "calculate remaining questions correctly" in new FormTestContext {
    new WithApplication(application) {
      val claimService: ClaimServiceImpl = app.injector.instanceOf[ClaimServiceImpl]

      val result: ClaimForm = claimService.calculateProgress(
        ClaimForm(
          "test",
          Map(
            "condition1" -> JsString("x"),
            "condition2" -> JsString("y"),
            "optionalField1" -> JsString("answer"),
            "requiredField1" -> JsString("answer")
          ),
          UUID.randomUUID(),
          UUID.randomUUID(),
          0, 0, 0, 0,
          Array.emptyByteArray
        )
      )

      result.answeredOptional must be equalTo 1
      result.answeredRequired must be equalTo 1
      result.optionalQuestions must be equalTo 2
      result.requiredQuestions must be equalTo 3
    }
  }
}
