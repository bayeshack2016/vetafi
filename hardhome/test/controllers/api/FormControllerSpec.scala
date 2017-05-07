package controllers.api

import java.net.URL
import java.util.UUID

import controllers.CSRFTest
import models.ClaimForm
import org.mockito.{ Matchers, Mockito }
import play.api.libs.json.{ JsResult, JsString, Json }
import play.api.mvc.Result
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import utils.auth.DefaultEnv
import com.mohiva.play.silhouette.test._
import reactivemongo.api.commands.UpdateWriteResult

import scala.concurrent.Future

class FormControllerSpec extends PlaySpecification with CSRFTest {
  sequential

  "The `getForm` action" should {
    "return 200 and form when get" in new FormControllerTestContext {

      Mockito.when(mockFormDao.find(identity.userID, testClaim.claimID, "VBA-21-0966-ARE"))
        .thenReturn(Future.successful(Some(testForm)))

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

      Mockito.when(mockFormDao.find(Matchers.any(), Matchers.any(), Matchers.any()))
        .thenReturn(Future.successful(None))

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

      Mockito.when(mockFormDao.find(identity.userID, testClaim.claimID))
        .thenReturn(Future.successful(Seq(testForm)))

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

      Mockito.when(mockFormDao.find(Matchers.any(), Matchers.any()))
        .thenReturn(Future.successful(Seq()))

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

      Mockito.when(mockFormDao.find(identity.userID, testClaim.claimID, "VBA-21-0966-ARE"))
        .thenReturn(Future.successful(Some(testForm)))

      Mockito.when(mockClaimService.calculateProgress(Matchers.any()))
        .thenReturn(testForm)

      Mockito.when(mockFormDao.save(
        Matchers.eq(identity.userID),
        Matchers.eq(testClaim.claimID),
        Matchers.eq("VBA-21-0966-ARE"),
        Matchers.any()
      ))
        .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

      Mockito.when(mockContactInfoService.updateContactInfo(identity.userID))
        .thenReturn(Future.successful(
          Some(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
        ))

      Mockito.when(mockUserValuesDao.update(Matchers.eq(identity.userID), Matchers.any()))
        .thenReturn(Future.successful(
          UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)
        ))

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
  }
}

