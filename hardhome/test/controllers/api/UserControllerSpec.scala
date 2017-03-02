package controllers.api

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.test._
import controllers.SilhouetteTestContext
import models.User
import org.specs2.mock.Mockito
import play.api.libs.json.JsResult
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv

import scala.concurrent.Future

class UserControllerSpec extends PlaySpecification with Mockito {
  sequential

  "The `getUser` action" should {

    "return 401 if unauthorized" in new SilhouetteTestContext {
      new WithApplication(application) {
        val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserController.getUser())
          .withAuthenticator[DefaultEnv](LoginInfo("invalid", "invalid"))).get

        status(result) must be equalTo UNAUTHORIZED
      }
    }

    "return 200 if authorized" in new SilhouetteTestContext {
      new WithApplication(application) {
        val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserController.getUser())
          .withAuthenticator[DefaultEnv](identity.loginInfo)).get

        status(result) must be equalTo OK

        val userValidation: JsResult[User] = contentAsJson(result).validate[User]

        userValidation.isSuccess must beTrue

        userValidation.get.userID must be equalTo userID
      }
    }
  }
}
