package controllers.api

import com.mohiva.play.silhouette.api.LoginInfo
import controllers.{ CSRFTest, SilhouetteTestContext }
import com.mohiva.play.silhouette.test._
import models.User
import org.specs2.mock.Mockito
import play.api.libs.json.Json
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv

import scala.concurrent.Future

class ClaimControllerSpec extends PlaySpecification with Mockito with CSRFTest {
  sequential

  "The `create` action" should {

    /*"return 201 if created" in new SilhouetteTestContext {
      new WithApplication(application) {
        val req = FakeRequest(POST, controllers.api.routes.ClaimController.create().url)
          .withJsonBody(Json.toJson(Seq("form1", "form2")))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq = addToken(req)

        val result: Future[Result] = route(app, csrfReq).get

        status(result) must be equalTo CREATED
      }
    }*/

    "return 200 if already created" in new SilhouetteTestContext {
      new WithApplication(application) {
        val req = FakeRequest(POST, controllers.api.routes.ClaimController.create().url)
          .withJsonBody(Json.toJson(Seq("form1", "form2")))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq = addToken(req)

        val result: Future[Result] = route(app, csrfReq).get

        val req2 = FakeRequest(POST, controllers.api.routes.ClaimController.create().url)
          .withJsonBody(Json.toJson(Seq("form1", "form2")))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq2 = addToken(req2)

        val result2: Future[Result] = route(app, csrfReq2).get

        println(contentAsJson(result))
        println(contentAsJson(result2))

        status(result) must be equalTo CREATED
        status(result2) must be equalTo OK
      }
    }
  }
}
