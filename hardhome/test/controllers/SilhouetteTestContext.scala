package controllers

import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Env, Environment, LoginInfo }
import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticator
import com.mohiva.play.silhouette.test.FakeEnvironment
import com.typesafe.config.ConfigFactory
import models.User
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.specs2.specification.Scope
import play.api.{ Application, Configuration }
import play.api.inject.bind
import play.api.inject.guice.GuiceApplicationBuilder
import utils.auth.DefaultEnv

import scala.concurrent.ExecutionContext.Implicits.global

trait SilhouetteTestContext extends Scope {

  /**
   * A fake Guice module.
   */
  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
    }
  }

  val userID: UUID = UUID.randomUUID()

  /**
   * An identity.
   */
  var identity = User(
    userID = userID,
    loginInfo = LoginInfo("credentials", "user@website.com"),
    firstName = None,
    lastName = None,
    fullName = None,
    email = None,
    avatarURL = None,
    activated = true,
    contact = None
  )

  /**
   * A Silhouette fake environment.
   */
  implicit val env: Environment[DefaultEnv] = new FakeEnvironment[DefaultEnv](Seq(identity.loginInfo -> identity))

  lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

object SilhouetteTestContext extends SilhouetteTestContext
