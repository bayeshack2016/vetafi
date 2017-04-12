package controllers.api

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.test._
import controllers.{ CSRFTest, SilhouetteTestContext }
import models.{ ClaimForm, UserValues }
import org.mockito.{ Matchers, Mockito }
import play.api.libs.json.{ JsResult, JsString, Json }
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import reactivemongo.api.commands.UpdateWriteResult
import utils.auth.DefaultEnv

import scala.concurrent.Future

class UserValuesControllerSpec extends PlaySpecification with CSRFTest {
  sequential

  "The `getUserValues` action" should {
    "return 401 if unauthorized" in new UserValuesControllerTestContext {
      new WithApplication(application) {
        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](LoginInfo("invalid", "invalid"))).get

        status(result) must be equalTo UNAUTHORIZED
      }
    }

    "create values and return 200 if no values" in new UserValuesControllerTestContext {

      Mockito.when(mockUserValuesDao.find(identity.userID))
        .thenReturn(Future.successful(None))
        .thenReturn(Future.successful(Some(UserValues(identity.userID, Map()))))

      Mockito.when(mockUserValuesDao.initialize(identity.userID))
        .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

      new WithApplication(application) {
        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(result) must be equalTo OK

        val validation: JsResult[UserValues] = contentAsJson(result).validate[UserValues]

        validation.isSuccess must beTrue
      }
    }

    "return 200 if values exist" in new UserValuesControllerTestContext {

      Mockito.when(mockUserValuesDao.find(identity.userID))
        .thenReturn(Future.successful(Some(UserValues(identity.userID, Map()))))

      new WithApplication(application) {
        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserValuesController.getUserValues())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(result) must be equalTo OK

        val validation: JsResult[UserValues] = contentAsJson(result).validate[UserValues]

        validation.isSuccess must beTrue
      }
    }
  }
}
