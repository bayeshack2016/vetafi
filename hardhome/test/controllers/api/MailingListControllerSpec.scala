package controllers.api

import java.time.Instant
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.Environment
import com.typesafe.config.ConfigFactory
import controllers.{CSRFTest, SilhouetteTestContext}
import models._
import models.daos.{ClaimDAO, FormDAO, MailingListDAO}
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.{Matchers, Mockito}
import play.api.{Application, Configuration}
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.{JsResult, JsValue, Json}
import play.api.mvc.{AnyContentAsEmpty, AnyContentAsJson}
import play.api.test.{FakeRequest, PlaySpecification, WithApplication}
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.commands.UpdateWriteResult
import services.FakeReactiveMongoApi
import services.documents.DocumentService
import services.forms.{ClaimService, FormConfigManager}
import utils.auth.DefaultEnv

import scala.concurrent.Future


trait MailingListControllerTestContext extends SilhouetteTestContext {

  val mockMailingListDao: MailingListDAO = Mockito.mock(classOf[MailingListDAO])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[MailingListDAO].toInstance(mockMailingListDao)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

class MailingListControllerSpec extends PlaySpecification with CSRFTest {
  sequential

  "The `subscribe` action" should {
    "return 200 for proper post data" in new MailingListControllerTestContext {

      Mockito.when(mockMailingListDao.save(Matchers.eq("test@test.com"), Matchers.any()))
      .thenReturn(
        Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
      )

      new WithApplication(application) {
        val getRequest: FakeRequest[AnyContentAsJson] =
          FakeRequest(controllers.api.routes.MailingListController.subscribe())
            .withJsonBody(Json.toJson(MailingListSubscription("test@test.com")))
        val csrfReq = addToken(getRequest)
        val getResult = route(app, csrfReq).get

        status(getResult) must be equalTo OK
      }
    }
  }
}
