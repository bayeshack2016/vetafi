package controllers.api

import java.time.Instant
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models._
import models.daos.{ ClaimDAO, FormDAO, UserDAO, UserValuesDAO }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.JsValue
import reactivemongo.api.commands.{ MultiBulkWriteResult, UpdateWriteResult, WriteResult }
import utils.auth.DefaultEnv
import _root_.services.forms.{ ClaimService, ContactInfoService }
import org.mockito.Mockito
import play.modules.reactivemongo.ReactiveMongoApi
import services.FakeReactiveMongoApi
import services.documents.DocumentService

import scala.concurrent.Future

trait FormControllerTestContext extends SilhouetteTestContext {

  var testClaim = Claim(
    identity.userID,
    UUID.randomUUID(),
    Claim.State.INCOMPLETE,
    java.util.Date.from(Instant.now()),
    Recipients(
      None, None,
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  var testForm = ClaimForm(
    "VBA-21-0966-ARE",
    Map.empty[String, JsValue],
    identity.userID,
    testClaim.claimID,
    0, 0, 0, 0,
    Array.emptyByteArray
  )

  var testUserValues = UserValues(
    identity.userID,
    Map.empty[String, JsValue]
  )

  val mockClaimDao: ClaimDAO = Mockito.mock(classOf[ClaimDAO])
  val mockFormDao: FormDAO = Mockito.mock(classOf[FormDAO])
  val mockUserValuesDao: UserValuesDAO = Mockito.mock(classOf[UserValuesDAO])
  val mockUserDao: UserDAO = Mockito.mock(classOf[UserDAO])
  val mockContactInfoService: ContactInfoService = Mockito.mock(classOf[ContactInfoService])
  val mockDocumentService: DocumentService = Mockito.mock(classOf[DocumentService])
  val mockClaimService: ClaimService = Mockito.mock(classOf[ClaimService])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[FormDAO].toInstance(mockFormDao)
      bind[UserDAO].toInstance(mockUserDao)
      bind[ContactInfoService].toInstance(mockContactInfoService)
      bind[DocumentService].toInstance(mockDocumentService)
      bind[UserValuesDAO].toInstance(mockUserValuesDao)
      bind[ClaimService].toInstance(mockClaimService)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}
