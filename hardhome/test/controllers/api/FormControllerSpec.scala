package controllers.api

import java.util.UUID

import controllers.CSRFTest
import models.ClaimForm
import org.specs2.mock.Mockito
import play.api.libs.json.{ JsResult, JsString, Json }
import play.api.mvc.Result
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv
import com.mohiva.play.silhouette.test._

import scala.concurrent.Future

class FormControllerSpec extends PlaySpecification with Mockito with CSRFTest {
  sequential

  "The `getForm` action" should {
    "return 200 and form when get" in new FormControllerTestContext {
      new WithApplication(application) {
        val req = FakeRequest(
          controllers.api.routes.FormController.getForm(testClaim.claimID, "VBA-21-0966-ARE")
        )
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val result: Future[Result] = route(app, req).get

        status(result) must be equalTo OK

        val formValidation: JsResult[ClaimForm] = contentAsJson(result).validate[ClaimForm]

        formValidation.isSuccess must beTrue
      }
    }

    "return 404 with bad id" in new FormControllerTestContext {
      new WithApplication(application) {
        val req = FakeRequest(
          controllers.api.routes.FormController.getForm(UUID.randomUUID(), "VBA-21-0966-ARE")
        )
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val result: Future[Result] = route(app, req).get

        status(result) must be equalTo NOT_FOUND
      }
    }
  }

  "The `getFormsForClaim` action" should {
    "return 200 and form when get" in new FormControllerTestContext {
      new WithApplication(application) {
        val req = FakeRequest(
          controllers.api.routes.FormController.getFormsForClaim(testClaim.claimID)
        )
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val result: Future[Result] = route(app, req).get

        status(result) must be equalTo OK

        val formsValidation: JsResult[Seq[ClaimForm]] = contentAsJson(result).validate[Seq[ClaimForm]]

        formsValidation.isSuccess must beTrue
      }
    }

    "return 404 with bad id" in new FormControllerTestContext {
      new WithApplication(application) {
        val req = FakeRequest(
          controllers.api.routes.FormController.getFormsForClaim(UUID.randomUUID())
        )
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val result: Future[Result] = route(app, req).get

        status(result) must be equalTo NOT_FOUND
      }
    }
  }

  "The `saveForm` action" should {
    "return 201 when save values" in new FormControllerTestContext {
      new WithApplication(application) {
        val values = Map("key" -> JsString("value"))

        val req = FakeRequest(
          POST,
          controllers.api.routes.FormController.saveForm(testClaim.claimID, "VBA-21-0966-ARE").url
        )
          .withJsonBody(Json.toJson(values))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq = addToken(req)

        val result: Future[Result] = route(app, csrfReq).get

        status(result) must be equalTo CREATED
      }
    }

    "return 201 when save/update values" in new FormControllerTestContext {
      new WithApplication(application) {
        val values1 = Map("key" -> JsString("value"))
        val values2 = Map("key" -> JsString("value2"), "newKey" -> JsString("x"))

        val req1 = addToken(FakeRequest(POST, controllers.api.routes.FormController.saveForm(testClaim.claimID, "VBA-21-0966-ARE").url)
          .withJsonBody(Json.toJson(values1))
          .withAuthenticator[DefaultEnv](identity.loginInfo))
        val req2 = addToken(FakeRequest(POST, controllers.api.routes.FormController.saveForm(testClaim.claimID, "VBA-21-0966-ARE").url)
          .withJsonBody(Json.toJson(values2))
          .withAuthenticator[DefaultEnv](identity.loginInfo))

        val result1: Future[Result] = route(app, req1).get
        val result2: Future[Result] = route(app, req2).get

        status(result2) must be equalTo CREATED

        // Also ContactInfoService.updateUserInfo should have been called
        identity.contact.get.phoneNumber.get must be equalTo "updated"
      }
    }

    "return 200 if authorized after update and return correct values" in new FormControllerTestContext {
      new WithApplication(application) {
        val values1 = Map("key" -> JsString("value"))
        val values2 = Map("key" -> JsString("value2"), "newKey" -> JsString("x"))

        val req1 = addToken(FakeRequest(POST, controllers.api.routes.FormController.saveForm(testClaim.claimID, "VBA-21-0966-ARE").url)
          .withJsonBody(Json.toJson(values1))
          .withAuthenticator[DefaultEnv](identity.loginInfo))

        val result1: Future[Result] = route(app, req1).get

        status(result1) must be equalTo CREATED

        val req2 = addToken(FakeRequest(POST, controllers.api.routes.FormController.saveForm(testClaim.claimID, "VBA-21-0966-ARE").url)
          .withJsonBody(Json.toJson(values2))
          .withAuthenticator[DefaultEnv](identity.loginInfo))

        val result2 = route(app, req2).get

        status(result2) must be equalTo CREATED

        testUserValues.values must be equalTo Map("key" -> JsString("value2"), "newKey" -> JsString("x"))
      }
    }
  }
}

