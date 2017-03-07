package controllers.api

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.Environment
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models._
import models.daos.{ ClaimDAO, FormDAO, UserValuesDAO }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.JsValue
import reactivemongo.api.commands.{ MultiBulkWriteResult, UpdateWriteResult, WriteResult }
import utils.auth.DefaultEnv

import scala.concurrent.Future

trait FormControllerTestContext extends SilhouetteTestContext {

  var testClaim = Claim(
    identity.userID,
    UUID.randomUUID(),
    Claim.State.INCOMPLETE,
    Recipients(
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  var testForm = ClaimForm(
    "test",
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

  class FakeClaimDao extends FormDAO {
    override def find(userID: UUID, claimID: UUID, key: String): Future[Option[ClaimForm]] = {
      if (key == testForm.key && claimID == testForm.claimID && userID == identity.userID) {
        Future.successful(Some(testForm))
      } else {
        Future.successful(None)
      }
    }

    override def find(userID: UUID, claimID: UUID): Future[Seq[ClaimForm]] = {
      if (claimID == testForm.claimID && userID == identity.userID) {
        Future.successful(Seq(testForm))
      } else {
        Future.successful(Seq.empty[ClaimForm])
      }
    }

    override def save(userID: UUID, claimID: UUID, key: String, claimForm: ClaimForm): Future[WriteResult] = {
      testForm = claimForm
      Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
    }
  }

  class FakeUserValuesDao extends UserValuesDAO {
    override def find(userID: UUID): Future[Option[UserValues]] = {
      if (userID == testUserValues.userID) {
        Future.successful(Some(testUserValues))
      } else {
        Future.successful(None)
      }
    }

    override def update(userID: UUID, values: Map[String, JsValue]): Future[WriteResult] = {
      testUserValues = testUserValues.copy(values = testUserValues.values)
      Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
    }
  }

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()

}
