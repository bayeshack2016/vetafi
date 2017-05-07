package controllers.api

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models.daos.{ UserDAO, UserValuesDAO }
import models._
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.Mockito
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.commands.{ UpdateWriteResult, WriteResult }
import services.FakeReactiveMongoApi
import utils.auth.DefaultEnv

import scala.concurrent.Future

trait UserValuesControllerTestContext extends SilhouetteTestContext {

  val mockUserDao: UserDAO = Mockito.mock(classOf[UserDAO])
  val mockUserValuesDao: UserValuesDAO = Mockito.mock(classOf[UserValuesDAO])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[UserDAO].toInstance(mockUserDao)
      bind[UserValuesDAO].toInstance(mockUserValuesDao)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}
