package services.documents

import java.net.URL
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.LoginInfo
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models._
import models.daos.{FormDAO, UserDAO}
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.mockito.{Matchers, Mockito}
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.JsValue
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Results}
import play.api.{Application, Configuration}
import play.api.test.{PlaySpecification, WithApplication, WsTestClient}
import play.core.server.Server
import reactivemongo.api.commands.{UpdateWriteResult, WriteResult}
import utils.seamlessdocs._
import utils.secrets.SecretsManager

import scala.concurrent.Future


trait SeamplessDocsServiceTestContext extends SilhouetteTestContext {

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

  def withTestClient[T](app: Application)(routes: scala.PartialFunction[play.api.mvc.RequestHeader, play.api.mvc.Handler])(block: WSClient => T): T = {
    Server.withRouter()(routes) { implicit port =>
      WsTestClient.withClient { client => block(client)}
    }
  }

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

  class FakeSeamlessDocsService extends SeamlessDocsService {
    override def formPrepare(formId: String, name: String, email: String, data: Map[String, JsValue]): Future[SeamlessApplicationCreateResponse] = ???

    override def getInviteUrl(applicationId: String): Future[URL] = ???

    override def getApplication(applicationId: String): Future[SeamlessApplication] = ???

    override def updatePdf(applicationId: String, data: Map[String, JsValue]): Future[URL] = ???
  }


  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[UserDAO].toInstance(new FakeUserDao)
      bind[FormDAO].toInstance(new FakeFormDAO)
      bind[SeamlessDocsService].toInstance(new FakeSeamlessDocsService)
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()
}

class SeamlessDocsDocumentServiceSpec extends PlaySpecification {

  "The SeamlessDocsDocumentService.render method" should {
    "work" in new SeamplessDocsServiceTestContext {

      val pdfUrl: String = "https://www.pdf.com"
      val fakeController: scala.PartialFunction[play.api.mvc.RequestHeader, play.api.mvc.Handler] = {
        case post if post.method == "GET" && post.uri == pdfUrl => Action {
          Results.Ok(Array[Byte](0x01, 0x02, 0x03))
        }
      }

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>

          val formDao = Mockito.mock(classOf[FormDAO])
          Mockito.when(formDao.save(Matchers.any(), Matchers.any(), Matchers.any(), Matchers.any()))
            .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))
          Mockito.when(formDao.find(Matchers.any(), Matchers.any(), Matchers.any()))
            .thenReturn(Future.successful(Some(testForm)))

          val userDao = Mockito.mock(classOf[UserDAO])
          Mockito.when(userDao.find(Matchers.any[UUID]))
            .thenReturn(Future.successful(Some(identity)))

          val seamlessDocsService = Mockito.mock(classOf[SeamlessDocsService])
          Mockito.when(seamlessDocsService.formPrepare(Matchers.any(), Matchers.any(), Matchers.any(), Matchers.any()))
            .thenReturn(Future.successful(SeamlessApplicationCreateResponse(result = true, "appId", "Mock app.")))
          Mockito.when(seamlessDocsService.updatePdf(Matchers.any(), Matchers.any()))
            .thenReturn(Future.successful(new URL(pdfUrl)))

          val service = new SeamlessDocsDocumentService(
            userDao,
            formDao,
            client,
            seamlessDocsService)


        })
      }
    }
  }
}
