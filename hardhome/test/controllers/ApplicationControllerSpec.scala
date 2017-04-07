package controllers

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticator
import com.mohiva.play.silhouette.test._
import models.User
import net.codingwell.scalaguice.ScalaModule
import org.specs2.mock.Mockito
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.concurrent.Execution.Implicits._
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv

/**
 * Test case for the [[controllers.ApplicationController]] class.
 */
class ApplicationControllerSpec extends PlaySpecification with Mockito {
  sequential

  "The `index` action" should {
    /*
    "redirect to login page if user is unauthorized" in new SilhouetteTestContext {
      new WithApplication(application) {
        val req = FakeRequest(routes.ApplicationController.index())
          .withAuthenticator[DefaultEnv](LoginInfo("invalid", "invalid"))

        val controller = app.injector.instanceOf[ApplicationController]

        val redirectResult = controller.index(req)

        status(redirectResult) must be equalTo SEE_OTHER

        val redirectURL: String = redirectLocation(redirectResult).getOrElse("")
        redirectURL must contain(routes.SignInController.view().toString)

        val Some(unauthorizedResult) = route(app, FakeRequest(GET, redirectURL))

        status(unauthorizedResult) must be equalTo OK
        contentType(unauthorizedResult) must beSome("text/html")
        contentAsString(unauthorizedResult) must contain("Silhouette - Sign In")
      }
    }*/

    "return 200 if user is authorized" in new SilhouetteTestContext {
      new WithApplication(application) {
        val Some(result) = route(app, FakeRequest(routes.ApplicationController.index())
          .withAuthenticator[DefaultEnv](identity.loginInfo))
        status(result) must beEqualTo(OK)
      }
    }
  }
}
