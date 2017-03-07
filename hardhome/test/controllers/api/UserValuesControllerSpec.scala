package controllers.api

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.test._
import controllers.{ CSRFTest, SilhouetteTestContext }
import models.UserValues
import org.specs2.mock.Mockito
import play.api.libs.json.{ JsResult, JsString, Json }
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv

import scala.concurrent.Future

class UserValuesControllerSpec extends PlaySpecification with Mockito with CSRFTest {
  sequential

  "The `getUserValues` action" should {
    "return 401 if unauthorized" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](LoginInfo("invalid", "invalid"))).get

        status(result) must be equalTo UNAUTHORIZED
      }
    }

    "return 404 if authorized but no values" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(result) must be equalTo NOT_FOUND
      }
    }

  }
}
