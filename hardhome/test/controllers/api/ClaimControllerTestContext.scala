package controllers.api

import java.time.Instant
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models._
import models.daos.{ ClaimDAO, FormDAO }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import reactivemongo.api.commands.{ MultiBulkWriteResult, UpdateWriteResult, WriteResult }
import utils.auth.DefaultEnv
import _root_.services.forms.{ ClaimService, FormConfigManager }
import org.mockito.Mockito
import play.api.libs.json.JsValue
import play.modules.reactivemongo.ReactiveMongoApi
import services.FakeReactiveMongoApi
import services.documents.DocumentService

import scala.concurrent.Future

trait ClaimControllerTestContext extends SilhouetteTestContext {

  val testIncompleteClaim = Claim(
    userID = identity.userID,
    claimID = UUID.randomUUID(),
    key = "fakeKey",
    state = Claim.State.INCOMPLETE,
    stateUpdatedAt = java.util.Date.from(Instant.now()),
    sentTo = Recipients(
      None, None,
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  var testForm = ClaimForm("VBA-21-0966-ARE", Map.empty[String, JsValue], identity.userID, testIncompleteClaim.claimID, 0, 0, 0, 0)

  val mockClaimDao: ClaimDAO = Mockito.mock(classOf[ClaimDAO])
  val mockFormDao: FormDAO = Mockito.mock(classOf[FormDAO])
  val mockClaimService: ClaimService = Mockito.mock(classOf[ClaimService])
  val mockDocumentService: DocumentService = Mockito.mock(classOf[DocumentService])
  val mockFormConfigManager: FormConfigManager = Mockito.mock(classOf[FormConfigManager])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[ClaimDAO].toInstance(mockClaimDao)
      bind[FormDAO].toInstance(mockFormDao)
      bind[ClaimService].toInstance(mockClaimService)
      bind[DocumentService].toInstance(mockDocumentService)
      bind[FormConfigManager].toInstance(mockFormConfigManager)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}
