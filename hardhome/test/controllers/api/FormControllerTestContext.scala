package controllers.api

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
import _root_.services.forms.ContactInfoService

import scala.concurrent.Future

trait FormControllerTestContext extends SilhouetteTestContext {

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

  class FakeFormDAO extends FormDAO {
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

  class FakeUserValuesDAO extends UserValuesDAO {
    override def find(userID: UUID): Future[Option[UserValues]] = {
      if (userID == testUserValues.userID) {
        Future.successful(Some(testUserValues))
      } else {
        Future.successful(None)
      }
    }

    override def update(userID: UUID, values: Map[String, JsValue]): Future[WriteResult] = {
      testUserValues = testUserValues.copy(values = testUserValues.values ++ values)
      Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
    }
  }

  class FakeUserDao extends UserDAO {
    override def find(loginInfo: LoginInfo): Future[Option[User]] = {
      Future.successful(Some(identity))
    }

    override def find(userID: UUID): Future[Option[User]] = {
      Future.successful(Some(identity))
    }

    override def save(user: User): Future[WriteResult] = {
      identity = user
      Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
    }

    override def updateContactInfo(user: User): Future[WriteResult] = {
      Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
    }

    override def setInactive(user: User): Future[WriteResult] = {
      Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
    }
  }

  class FakeContactInfoService extends ContactInfoService {
    override def updateContactInfo(userID: UUID): Future[Option[WriteResult]] = {
      identity = identity.copy(contact = Some(Contact(Some("updated"), None)))
      Future.successful(
        Some(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None))
      )
    }
  }

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[FormDAO].toInstance(new FakeFormDAO())
      bind[UserValuesDAO].toInstance(new FakeUserValuesDAO())
      bind[UserDAO].toInstance(new FakeUserDao())
      bind[ContactInfoService].toInstance(new FakeContactInfoService())
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()

}
