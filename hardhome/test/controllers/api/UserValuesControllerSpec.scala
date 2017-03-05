package controllers.api

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.test._
import controllers.{ CSRFTest, SilhouetteTestContext }
import models.UserValues
import org.specs2.mock.Mockito
import play.api.libs.json.{ JsResult, Json }
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv

import scala.concurrent.Future

class UserValuesControllerSpec extends PlaySpecification with Mockito with CSRFTest {
  sequential

  "The `getUserValues` action" should {
    "return 401 if unauthorized" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](LoginInfo("invalid", "invalid"))).get

        status(result) must be equalTo UNAUTHORIZED
      }
    }

    "return 404 if authorized but no values" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(result) must be equalTo NOT_FOUND
      }
    }

    "return 201 when save values" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val values = UserValues(userID, Map("key" -> "value"))

        val req = FakeRequest(POST, controllers.api.routes.UserValuesController.updateUserValues().url)
          .withJsonBody(Json.toJson(values))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq = addToken(req)

        val result: Future[Result] = route(app, csrfReq).get

        status(result) must be equalTo CREATED
      }
    }

    "return 201 when save/update values" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val values1 = UserValues(userID, Map("key" -> "value"))
        val values2 = UserValues(userID, Map("key" -> "value2", "newKey" -> "x"))

        val req1 = addToken(FakeRequest(POST, controllers.api.routes.UserValuesController.updateUserValues().url)
          .withJsonBody(Json.toJson(values1))
          .withAuthenticator[DefaultEnv](identity.loginInfo))
        val req2 = addToken(FakeRequest(POST, controllers.api.routes.UserValuesController.updateUserValues().url)
          .withJsonBody(Json.toJson(values2))
          .withAuthenticator[DefaultEnv](identity.loginInfo))

        val result1: Future[Result] = route(app, req1).get
        val result2: Future[Result] = route(app, req2).get

        status(result2) must be equalTo CREATED
      }
    }

    "return 200 if authorized after update and return correct values" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val values1 = UserValues(userID, Map("key" -> "value"))
        val values2 = UserValues(userID, Map("key" -> "value2", "newKey" -> "x"))
        val getRequest: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

        val req1 = addToken(FakeRequest(POST, controllers.api.routes.UserValuesController.updateUserValues().url)
          .withJsonBody(Json.toJson(values1))
          .withAuthenticator[DefaultEnv](identity.loginInfo))

        val result1: Future[Result] = route(app, req1).get

        status(result1) must be equalTo CREATED

        val req2 = addToken(FakeRequest(POST, controllers.api.routes.UserValuesController.updateUserValues().url)
          .withJsonBody(Json.toJson(values2))
          .withAuthenticator[DefaultEnv](identity.loginInfo))

        val result2 = route(app, req2).get

        status(result2) must be equalTo CREATED

        val getResult: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(getResult) must be equalTo OK

        val userValuesValidation: JsResult[UserValues] = contentAsJson(getResult).validate[UserValues]

        userValuesValidation.isSuccess must beTrue

        userValuesValidation.get.values must be equalTo Map("key" -> "value2", "newKey" -> "x")
      }
    }
  }
}
