package controllers.api

import com.mohiva.play.silhouette.api.LoginInfo
import controllers.{CSRFTest, SilhouetteTestContext}
import com.mohiva.play.silhouette.test._
import models.User
import org.specs2.mock.Mockito
import play.api.libs.json.{JsResult, Json}
import play.api.mvc.{AnyContentAsEmpty, Result}
import play.api.test.{FakeRequest, PlaySpecification, WithApplication}
import utils.auth.DefaultEnv

import scala.concurrent.Future

/**
  * Created by jeffquinn on 3/2/17.
  */
class ClaimControllerSpec extends PlaySpecification with Mockito with CSRFTest {
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
  }
}
