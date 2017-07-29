package services

import java.net.URL
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.LoginInfo
import com.typesafe.config.ConfigFactory
import models.{ FormConfig, User, UserValues }
import models.daos.{ UserDAO, UserValuesDAO }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.{ ArgumentCaptor, Matchers, Mockito }
import org.specs2.specification.Scope
import play.api.{ Application, Configuration }
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.{ JsString, JsValue }
import play.api.libs.ws.WSClient
import play.api.test.{ PlaySpecification, WithApplication }
import reactivemongo.api.commands.UpdateWriteResult
import services.documents.SeamlessDocsDocumentService
import utils.seamlessdocs.SeamlessApplicationCreateResponse

import scala.concurrent.duration.Duration
import scala.concurrent.{ Await, Future }
import scala.util.{ Failure, Success }

trait UserServiceTestContext extends Scope {

  val mockUserDAO: UserDAO = Mockito.mock(classOf[UserDAO])
  val mockUserValuesDAO: UserValuesDAO = Mockito.mock(classOf[UserValuesDAO])
  val mockUserValuesService: UserValuesService = Mockito.mock(classOf[UserValuesService])

  /**
   * A fake Guice module.
   */
  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[UserDAO].toInstance(mockUserDAO)
      bind[UserValuesDAO].toInstance(mockUserValuesDAO)
      bind[UserValuesService].toInstance(mockUserValuesService)
    }
  }

  val userID: UUID = UUID.randomUUID()

  /**
   * An identity.
   */
  var fakeUser = User(
    userID = userID,
    loginInfo = LoginInfo("xxx", "xxx"),
    firstName = None,
    lastName = None,
    fullName = None,
    email = Some("user@website.com"),
    avatarURL = None,
    activated = true,
    contact = None
  )

  lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

class UserServiceImplSpec extends PlaySpecification {
  sequential

  "The save method" should {
    "Save the user and update user values" in new UserServiceTestContext {
      Mockito.when(mockUserDAO.save(Matchers.any()))
        .thenReturn(Future.successful(UpdateWriteResult(
          ok = true,
          1, 1, Seq(), Seq(), None, None, None
        )))

      Mockito.when(mockUserValuesDAO.update(Matchers.eq(userID), Matchers.any()))
        .thenReturn(Future.successful(UpdateWriteResult(
          ok = true,
          1, 1, Seq(), Seq(), None, None, None
        )))

      Mockito.when(mockUserValuesDAO.initialize(Matchers.eq(userID)))
        .thenReturn(Future.successful(UpdateWriteResult(
          ok = true,
          1, 1, Seq(), Seq(), None, None, None
        )))

      Mockito.when(mockUserValuesDAO.find(Matchers.eq(userID)))
        .thenReturn(Future.successful(Some(UserValues(userID, Map()))))

      Mockito.when(mockUserValuesService.updateUserValues(Matchers.any(), Matchers.any()))
        .thenReturn(UserValues(userID, Map("test" -> JsString("test"))))

      val mockUserValuesDAOUpdateIdCapture: ArgumentCaptor[UUID] = ArgumentCaptor.forClass(classOf[UUID])
      val mockUserValuesDAOUpdateValuesCapture: ArgumentCaptor[Map[String, JsValue]] = ArgumentCaptor.forClass(classOf[Map[String, JsValue]])

      new WithApplication(application) {
        val service = app.injector.instanceOf[UserService]

        val result: User = Await.result(service.save(fakeUser), Duration.Inf)

        result must be equalTo fakeUser

        Mockito.verify(mockUserValuesDAO, Mockito.times(1)).update(
          mockUserValuesDAOUpdateIdCapture.capture(),
          mockUserValuesDAOUpdateValuesCapture.capture()
        )

        mockUserValuesDAOUpdateValuesCapture.getValue must be equalTo Map("test" -> JsString("test"))
      }
    }
  }
}
