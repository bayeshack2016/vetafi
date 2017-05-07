package controllers.api

import java.time.Instant
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.mohiva.play.silhouette.test._
import com.typesafe.config.ConfigFactory
import controllers.{ CSRFTest, SilhouetteTestContext }
import models._
import models.daos.{ ClaimDAO, FormDAO, UserDAO, UserValuesDAO }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.Mockito
import org.specs2.mock.Mockito
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.{ JsResult, JsValue }
import play.api.mvc.{ AnyContentAsEmpty, Result }
import play.api.test.{ FakeRequest, PlaySpecification, WithApplication }
import play.modules.reactivemongo.ReactiveMongoApi
import services.FakeReactiveMongoApi
import services.documents.DocumentService
import services.forms.{ ClaimService, ContactInfoService }
import utils.auth.DefaultEnv

import scala.concurrent.Future

trait UserControllerTestContext extends SilhouetteTestContext {

  val mockUserDao: UserDAO = Mockito.mock(classOf[UserDAO])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[UserDAO].toInstance(mockUserDao)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

class UserControllerSpec extends PlaySpecification with CSRFTest {
  sequential

  "The `getUser` action" should {

    "return 401 if unauthorized" in new UserControllerTestContext {
      new WithApplication(application) {
        val request: FakeRequest[AnyContentAsEmpty.type] = FakeRequest().withAuthenticator(identity.loginInfo)

        val result: Future[Result] = route(app, FakeRequest(controllers.api.routes.UserController.getUser())
          .withAuthenticator[DefaultEnv](LoginInfo("invalid", "invalid"))).get

        status(result) must be equalTo UNAUTHORIZED
      }
    }

    "return 200 if authorized" in new UserControllerTestContext {
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
