package services.documents

import java.net.URL
import java.time.Instant
import java.util.UUID

import com.mohiva.play.silhouette.api.LoginInfo
import com.typesafe.config.ConfigFactory
import models._
import models.daos.{FormDAO, UserDAO}
import modules.JobModule
import org.hamcrest.{BaseMatcher, Description}
import org.mockito.{Matchers, Mockito}
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.{JsString, JsValue}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, Results}
import play.api.test.{PlaySpecification, WithApplication, WsTestClient}
import play.api.{Application, Configuration}
import play.core.server.Server
import reactivemongo.api.commands.UpdateWriteResult
import services.forms.FormConfigManager
import utils.seamlessdocs._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

trait SeamplessDocsServiceTestContext extends Scope {
  var identity = User(
    userID = UUID.randomUUID(),
    loginInfo = LoginInfo("credentials", "user@website.com"),
    firstName = Some("bob"),
    lastName = Some("smith"),
    fullName = Some("bob smith"),
    email = Some("user@email.com"),
    avatarURL = None,
    activated = true,
    contact = None
  )

  var testClaim = Claim(
    identity.userID,
    UUID.randomUUID(),
    Claim.State.INCOMPLETE,
    java.util.Date.from(Instant.now()),
    Recipients(
      None, None,
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  var testForm = ClaimForm(
    "VBA-21-0966-ARE",
    Map[String, JsValue]("key" -> JsString("value")),
    identity.userID,
    testClaim.claimID,
    0, 0, 0, 0,
    Array.emptyByteArray
  )

  var testFormWithExternal = ClaimForm(
    "withExternal",
    Map[String, JsValue]("key" -> JsString("value")),
    identity.userID,
    testClaim.claimID,
    0, 0, 0, 0,
    Array.emptyByteArray,
    Some("id"),
    Some("id")
  )

  var fakePdf: Array[Byte] = Array[Byte](0x01, 0x02, 0x03)

  var testUserValues = UserValues(
    identity.userID,
    Map.empty[String, JsValue]
  )

  var fakeFormConfig = FormConfig("fake", description = "fake",
    vfi = VetafiInfo(
      title = "fake",
      summary = "summary",
      required = true,
      externalId = "fake",
      externalSignerId = "fake"
    ),
    fields = Seq())

  var fakeApplicationCreateResponse = SeamlessApplicationCreateResponse(
    true, UUID.randomUUID().toString, "fake")

  val pdfUrl: String = "https://www.pdf.com"
  val inviteUrl: String = "https://www.invite.com"
  val fakeController: scala.PartialFunction[play.api.mvc.RequestHeader, play.api.mvc.Handler] = {
    case post if post.method == "POST" && post.uri == pdfUrl => Action {
      Results.Ok(fakePdf)
    }

    case get if get.method == "GET" && get.uri == inviteUrl => Action {
      Results.Ok(inviteUrl)
    }
  }

  def withTestClient[T](app: Application)(routes: scala.PartialFunction[play.api.mvc.RequestHeader, play.api.mvc.Handler])(block: WSClient => T): T = {
    Server.withRouter()(routes) { implicit port =>
      WsTestClient.withClient { client => block(client) }
    }
  }

  lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .build()

  class HasCorrectUpdates(applicationId: String, fakePdf: Array[Byte]) extends BaseMatcher[ClaimForm] {
    override def matches(o: scala.Any): Boolean = {
      o.asInstanceOf[ClaimForm].externalApplicationId.get == applicationId &&
        (o.asInstanceOf[ClaimForm].pdf sameElements fakePdf)
    }

    override def describeMismatch(o: scala.Any, description: Description): Unit = {

    }

    override def describeTo(description: Description): Unit = {

    }
  }

  class HasCorrectApplicationId(applicationId: String) extends BaseMatcher[ClaimForm] {
    override def matches(o: scala.Any): Boolean = {
      o.asInstanceOf[ClaimForm].externalApplicationId.get == applicationId
    }

    override def describeMismatch(o: scala.Any, description: Description): Unit = {

    }

    override def describeTo(description: Description): Unit = {

    }
  }

}

class SeamlessDocsDocumentServiceSpec extends PlaySpecification {
  sequential

  //TODO rewrite all these tests

  "The SeamlessDocsDocumentService.render method" should {

    "work if the form already has an application id" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val formDao = Mockito.mock(classOf[FormDAO])
          Mockito.when(formDao.save(
            Matchers.eq(testFormWithExternal.userID),
            Matchers.eq(testFormWithExternal.claimID),
            Matchers.eq(testFormWithExternal.key),
            Matchers.argThat(new HasCorrectUpdates(fakeApplicationCreateResponse.application_id, fakePdf))
          ))
            .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

          val userDao = Mockito.mock(classOf[UserDAO])

          val seamlessDocsService = Mockito.mock(classOf[SeamlessDocsService])
          Mockito.when(seamlessDocsService.updatePdf(
            Matchers.eq(testFormWithExternal.externalApplicationId.get),
            Matchers.any()
          ))
            .thenReturn(Future.successful(Left(new URL(pdfUrl))))

          val formConfigManager = Mockito.mock(classOf[FormConfigManager])
          val fakeMap = Mockito.mock(classOf[Map[String, FormConfig]])
          Mockito.when(fakeMap.apply(Matchers.any()))
            .thenReturn(fakeFormConfig)
          Mockito.when(formConfigManager.getFormConfigs)
            .thenReturn(fakeMap)

          val service = new SeamlessDocsDocumentService(
            userDao,
            formDao,
            client,
            seamlessDocsService,
            formConfigManager
          )

          service.render(testFormWithExternal).onComplete {
            case Success(bytes) => bytes must be equalTo fakePdf
            case Failure(_) => failure
          }
        })
      }
    }

    "not work if saving form fails" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val formDao = Mockito.mock(classOf[FormDAO])
          Mockito.when(formDao.save(
            Matchers.eq(testFormWithExternal.userID),
            Matchers.eq(testFormWithExternal.claimID),
            Matchers.eq(testFormWithExternal.key),
            Matchers.argThat(new HasCorrectUpdates(fakeApplicationCreateResponse.application_id, fakePdf))
          ))
            .thenReturn(Future.successful(UpdateWriteResult(ok = false, 1, 1, Seq(), Seq(), None, None, None)))

          val userDao = Mockito.mock(classOf[UserDAO])

          val seamlessDocsService = Mockito.mock(classOf[SeamlessDocsService])
          Mockito.when(seamlessDocsService.updatePdf(
            Matchers.eq(testFormWithExternal.externalApplicationId.get),
            Matchers.any()
          ))
            .thenReturn(Future.successful(Left(new URL(pdfUrl))))

          val formConfigManager = Mockito.mock(classOf[FormConfigManager])
          val fakeMap = Mockito.mock(classOf[Map[String, FormConfig]])
          Mockito.when(fakeMap.apply(Matchers.any()))
            .thenReturn(fakeFormConfig)
          Mockito.when(formConfigManager.getFormConfigs)
            .thenReturn(fakeMap)

          val service = new SeamlessDocsDocumentService(
            userDao,
            formDao,
            client,
            seamlessDocsService,
            formConfigManager
          )

          service.render(testFormWithExternal).onComplete {
            case Success(_) => ko
            case Failure(_) => ok
          }
        })
      }
    }
  }

  "The SeamlessDocsDocumentService.signatureLink method" should {
    "work if the form does not already have an application id" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val formDao = Mockito.mock(classOf[FormDAO])
          Mockito.when(formDao.save(
            Matchers.eq(testForm.userID),
            Matchers.eq(testForm.claimID),
            Matchers.eq(testForm.key),
            Matchers.argThat(new HasCorrectApplicationId(fakeApplicationCreateResponse.application_id))
          ))
            .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

          val userDao = Mockito.mock(classOf[UserDAO])
          Mockito.when(userDao.find(Matchers.eq(identity.userID)))
            .thenReturn(Future.successful(Some(identity)))

          val seamlessDocsService = Mockito.mock(classOf[SeamlessDocsService])
          Mockito.when(seamlessDocsService.formPrepare(
            Matchers.eq(fakeApplicationCreateResponse.application_id),
            Matchers.eq(identity.fullName.get),
            Matchers.eq(identity.email.get),
            Matchers.any(),
            Matchers.eq(testForm.responses)
          ))
            .thenReturn(Future.successful(Left(SeamlessApplicationCreateResponse(result = true, "appId", "Mock app."))))
          Mockito.when(seamlessDocsService.getInviteUrl(
            Matchers.eq(fakeApplicationCreateResponse.application_id)
          ))
            .thenReturn(Future.successful(new URL(inviteUrl)))

          val formConfigManager = Mockito.mock(classOf[FormConfigManager])
          val fakeMap = Mockito.mock(classOf[Map[String, FormConfig]])
          Mockito.when(fakeMap.apply(Matchers.any()))
            .thenReturn(fakeFormConfig)
          Mockito.when(formConfigManager.getFormConfigs)
            .thenReturn(fakeMap)

          val service = new SeamlessDocsDocumentService(
            userDao,
            formDao,
            client,
            seamlessDocsService,
            formConfigManager
          )

          service.signatureLink(testForm).onComplete {
            case Success(url) => url must be equalTo new URL(inviteUrl)
            case Failure(_) => failure
          }
        })
      }

    }
    "work if the form already has an application id" in new SeamplessDocsServiceTestContext {
      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val formDao = Mockito.mock(classOf[FormDAO])
          Mockito.when(formDao.save(
            Matchers.eq(testFormWithExternal.userID),
            Matchers.eq(testFormWithExternal.claimID),
            Matchers.eq(testFormWithExternal.key),
            Matchers.argThat(new HasCorrectUpdates(fakeApplicationCreateResponse.application_id, fakePdf))
          ))
            .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

          val userDao = Mockito.mock(classOf[UserDAO])

          val seamlessDocsService = Mockito.mock(classOf[SeamlessDocsService])
          Mockito.when(seamlessDocsService.formPrepare(
            Matchers.eq(fakeApplicationCreateResponse.application_id),
            Matchers.eq(identity.fullName.get),
            Matchers.eq(identity.email.get),
            Matchers.any(),
            Matchers.eq(testFormWithExternal.responses)
          ))
            .thenReturn(Future.successful(Left(SeamlessApplicationCreateResponse(result = true, "appId", "Mock app."))))
          Mockito.when(seamlessDocsService.getInviteUrl(
            Matchers.eq(fakeApplicationCreateResponse.application_id)
          ))
            .thenReturn(Future.successful(new URL(inviteUrl)))

          val formConfigManager = Mockito.mock(classOf[FormConfigManager])
          val fakeMap = Mockito.mock(classOf[Map[String, FormConfig]])
          Mockito.when(fakeMap.apply(Matchers.any()))
            .thenReturn(fakeFormConfig)
          Mockito.when(formConfigManager.getFormConfigs)
            .thenReturn(fakeMap)

          val service = new SeamlessDocsDocumentService(
            userDao,
            formDao,
            client,
            seamlessDocsService,
            formConfigManager
          )

          service.signatureLink(testFormWithExternal).onComplete {
            case Success(url) => url must be equalTo new URL(inviteUrl)
            case Failure(_) => failure
          }
        })
      }
    }
  }
}
