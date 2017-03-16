package services.forms

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models.daos.UserDAO
import models.{ Contact, User, UserValues }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import reactivemongo.api.commands.{ UpdateWriteResult, WriteResult }
import utils.auth.DefaultEnv

import scala.concurrent.Future

trait ContactInfoServiceTestContext extends SilhouetteTestContext {

  val testMapping: Map[(User, Option[String]) => User, Seq[Seq[String]]] = Map(
    ((user: User, value: Option[String]) => {
      user.copy(firstName = value)
    },
      Seq(
        Seq("attr1_1", "attr2_1"),
        Seq("attr1_2", "attr2_2")
      ))
  )

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
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}
