package controllers.api

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models._
import models.daos.ClaimDAO
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import reactivemongo.api.commands.{ MultiBulkWriteResult, WriteResult }
import utils.auth.DefaultEnv

import scala.concurrent.Future

trait ClaimControllerTestContext extends SilhouetteTestContext {

  var testClaim = Claim(
    identity.userID,
    UUID.randomUUID(),
    Claim.State.INCOMPLETE,
    Recipients(
      None, None,
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  class FakeClaimDao extends ClaimDAO {
    override def findClaims(userID: UUID): Future[Seq[Claim]] = {
      if (userID == identity.userID) {
        Future.successful(Seq(testClaim))
      } else {
        Future.successful(Seq())
      }
    }

    override def findClaim(userID: UUID, claimID: UUID): Future[Option[Claim]] = {
      if (userID == identity.userID && claimID == testClaim.claimID) {
        Future.successful(Some(testClaim))
      } else {
        Future.successful(None)
      }
    }

    override def findIncompleteClaim(userID: UUID): Future[Option[Claim]] = {
      if (testClaim.state == Claim.State.INCOMPLETE) {
        Future.successful(Some(testClaim))
      } else {
        Future.successful(None)
      }
    }

    override def create(userID: UUID, forms: Seq[String]): Future[MultiBulkWriteResult] = ???

    override def submit(userID: UUID, claimID: UUID): Future[WriteResult] = ???
  }

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[ClaimDAO].toInstance(new FakeClaimDao())
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}
