package controllers.api

import java.util.UUID

import com.mohiva.play.silhouette.api.LoginInfo
import controllers.{CSRFTest, SilhouetteTestContext}
import com.mohiva.play.silhouette.test._
import models._
import org.specs2.mock.Mockito
import play.api.libs.json.{JsResult, Json}
import play.api.mvc.{AnyContentAsEmpty, Result}
import play.api.test.{FakeRequest, PlaySpecification, WithApplication}
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

  "The `getClaims` action" should {
    "return 200 and claims as json if found" in new ClaimControllerTestContext {
      new WithApplication(application) {
        val getRequest = FakeRequest(controllers.api.routes.ClaimController.getClaims())
          .withAuthenticator(identity.loginInfo)
        val getResult = route(app, getRequest).get

        status(getResult) must be equalTo OK

        val claimsValidation: JsResult[Seq[Claim]] = contentAsJson(getResult).validate[Seq[Claim]]

        claimsValidation.isSuccess must beTrue
      }
    }

    "return 401 if not authed" in new ClaimControllerTestContext {
      new WithApplication(application) {
        val getRequest = FakeRequest(controllers.api.routes.ClaimController.getClaims())
          .withAuthenticator(LoginInfo("credential", "nobody"))
        val getResult = route(app, getRequest).get

        status(getResult) must be equalTo UNAUTHORIZED
      }
    }
  }

  "The `create` action" should {

    // TODO mockout DAO

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

  "The `submit` action" should {
    "return 200" in new ClaimControllerTestContext {
      new WithApplication(application) {
        val req = FakeRequest(POST, controllers.api.routes.ClaimController.submit(testClaim.claimID).url)
          .withJsonBody(Json.toJson(Recipients(
            Some(Address(
              name = Some("joe")
            )),
            Some(Address(
              name = Some("john")
            )),
            Seq("email@website.com"),
            Seq(Address(
              name = Some("jill")
            ))
          )))
          .withAuthenticator[DefaultEnv](identity.loginInfo)
        val csrfReq = addToken(req)
        val result: Future[Result] = route(app, csrfReq).get

        status(result) must be equalTo OK

        testClaim.state must be equalTo Claim.State.SUBMITTED
      }
    }
  }
}
