package controllers.api

import java.util.UUID

import com.mohiva.play.silhouette.api.LoginInfo
import controllers.{ CSRFTest, SilhouetteTestContext }
import com.mohiva.play.silhouette.test._
import models.{ Claim, User, UserValues }
import org.specs2.mock.Mockito
import play.api.libs.json.{ JsResult, Json }
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv

import scala.concurrent.Future

class ClaimControllerSpec extends PlaySpecification with Mockito with CSRFTest {
  sequential

  "The `getClaim` action" should {
    "return 200 and claim as json if found" in new ClaimControllerTestContext {
      new WithApplication(application) {
        val getRequest: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest(controllers.api.routes.ClaimController.getClaim(testClaim.claimID))
            .withAuthenticator(identity.loginInfo)
        val csrfReq = addToken(getRequest)
        val getResult = route(app, csrfReq).get

        status(getResult) must be equalTo OK

        val userValuesValidation: JsResult[Claim] = contentAsJson(getResult).validate[Claim]

        userValuesValidation.isSuccess must beTrue
      }
    }

    "return 404 and empty if not found" in new ClaimControllerTestContext {
      new WithApplication(application) {
        val getRequest: FakeRequest[AnyContentAsEmpty.type] =
          FakeRequest(controllers.api.routes.ClaimController.getClaim(UUID.randomUUID()))
            .withAuthenticator(identity.loginInfo)
        val csrfReq = addToken(getRequest)
        val getResult = route(app, csrfReq).get

        status(getResult) must be equalTo NOT_FOUND
      }
    }
  }

  "The `create` action" should {
    "return 201 if created" in new SilhouetteTestContext {
      new WithApplication(application) {
        val req = FakeRequest(POST, controllers.api.routes.ClaimController.create().url)
          .withJsonBody(Json.toJson(Seq("form1", "form2")))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq = addToken(req)

        val result: Future[Result] = route(app, csrfReq).get

        status(result) must be equalTo CREATED
      }
    }

    "return 200 if already created" in new SilhouetteTestContext {
      new WithApplication(application) {
        val req = FakeRequest(POST, controllers.api.routes.ClaimController.create().url)
          .withJsonBody(Json.toJson(Seq("form1", "form2")))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq = addToken(req)

        val result: Future[Result] = route(app, csrfReq).get

        status(result) must be equalTo CREATED

        val req2 = FakeRequest(POST, controllers.api.routes.ClaimController.create().url)
          .withJsonBody(Json.toJson(Seq("form1", "form2")))
          .withAuthenticator[DefaultEnv](identity.loginInfo)

        val csrfReq2 = addToken(req2)

        val result2: Future[Result] = route(app, csrfReq2).get

        status(result2) must be equalTo OK
      }
    }
  }
}
