package controllers.api

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{Environment, LoginInfo}
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models.daos.UserDAO
import models._
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import play.api.{Application, Configuration}
import play.api.inject.guice.GuiceApplicationBuilder
import reactivemongo.api.commands.{UpdateWriteResult, WriteResult}
import utils.auth.DefaultEnv
import utils.forms.ContactInfoService

import scala.concurrent.Future

trait UserValuesControllerTestContext extends SilhouetteTestContext {

  class FakeContactInfoService extends ContactInfoService {
    override def updateUserInfo(userID: UUID, values: UserValues): Future[WriteResult] = {
      identity = identity.copy(contact = Some(Contact(Some("updated"), None)))
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

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
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
