package controllers.api

import controllers.CSRFTest
import models.UserValues
import org.specs2.mock.Mockito
import play.api.libs.json.{ JsResult, JsString, Json }
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv
import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.test._

import scala.concurrent.Future

class FormControllerSpec extends PlaySpecification with Mockito with CSRFTest {
  sequential

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
        val getRequest: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

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

        val getResult: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(getResult) must be equalTo OK

        val userValuesValidation: JsResult[UserValues] = contentAsJson(getResult).validate[UserValues]

        userValuesValidation.isSuccess must beTrue

        userValuesValidation.get.values must be equalTo Map("key" -> JsString("value2"), "newKey" -> JsString("x"))
      }
    }
  }
}

