package controllers.api

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
import _root_.services.forms.ClaimService
import org.mockito.Mockito

import scala.concurrent.Future

trait ClaimControllerTestContext extends SilhouetteTestContext {

  val testIncompleteClaim = Claim(
    identity.userID,
    UUID.randomUUID(),
    Claim.State.INCOMPLETE,
    Recipients(
      None, None,
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  val mockClaimDao: ClaimDAO = Mockito.mock(classOf[ClaimDAO])
  val mockFormDao: FormDAO = Mockito.mock(classOf[FormDAO])
  val mockClaimService: ClaimService = Mockito.mock(classOf[ClaimService])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[ClaimDAO].toInstance(mockClaimDao)
      bind[FormDAO].toInstance(mockFormDao)
      bind[ClaimService].toInstance(mockClaimService)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}
