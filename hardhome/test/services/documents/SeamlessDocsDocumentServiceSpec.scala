package services.documents

import java.net.URL
import java.time.Instant
import java.util.UUID

import com.google.inject.AbstractModule
import com.mohiva.play.silhouette.api.{ Environment, LoginInfo }
import com.typesafe.config.ConfigFactory
import controllers.SilhouetteTestContext
import models._
import models.daos.{ ClaimDAO, FormDAO, UserDAO, UserValuesDAO }
import modules.JobModule
import net.codingwell.scalaguice.ScalaModule
import org.hamcrest.{ BaseMatcher, Description }
import org.mockito.{ Matchers, Mockito }
import org.specs2.specification.Scope
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.{ JsString, JsValue }
import play.api.libs.ws.WSClient
import play.api.mvc.{ Action, Results }
import play.api.test.{ PlaySpecification, WithApplication, WsTestClient }
import play.api.{ Application, Configuration }
import play.core.server.Server
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.commands.UpdateWriteResult
import services.FakeReactiveMongoApi
import services.forms.{ ClaimService, ContactInfoService, FormConfigManager }
import utils.auth.DefaultEnv
import utils.seamlessdocs._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{ Await, Future }
import scala.util.{ Failure, Success }

trait SeamplessDocsServiceTestContext extends SilhouetteTestContext {
  identity = User(
    userID = userID,
    loginInfo = LoginInfo("credentials", "user@website.com"),
    firstName = Some("fname"),
    lastName = Some("lname"),
    fullName = Some("fname lname"),
    email = Some("test@test.com"),
    avatarURL = None,
    activated = true,
    contact = Some(Contact(Some("1111111111"), Some(Address())))
  )

  var testClaim = Claim(
    userID = identity.userID,
    claimID = UUID.randomUUID(),
    key = "fakeKey",
    state = Claim.State.INCOMPLETE,
    stateUpdatedAt = java.util.Date.from(Instant.now()),
    sentTo = Recipients(
      None, None,
      Seq("test@website.com"),
      Seq(Address(name = Some("name")))
    )
  )

  var testForm = ClaimForm("VBA-21-0966-ARE", Map[String, JsValue]("key" -> JsString("value")), identity.userID, testClaim.claimID, 0, 0, 0, 0)

  var testFormWithExternal = ClaimForm(
    "withExternal",
    Map[String, JsValue]("key" -> JsString("value")),
    identity.userID,
    testClaim.claimID,
    0,
    0,
    0,
    0,
    externalFormId = Some("formId"),
    externalApplicationId = Some("id")
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
    true, UUID.randomUUID().toString, "fake"
  )

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

  class HasCorrectApplicationId(applicationId: String) extends BaseMatcher[ClaimForm] {
    override def matches(o: scala.Any): Boolean = {
      o.asInstanceOf[ClaimForm].externalApplicationId.get == applicationId
    }

    override def describeMismatch(o: scala.Any, description: Description): Unit = {

    }

    override def describeTo(description: Description): Unit = {

    }
  }

  val mockSeamlessDocsService: SeamlessDocsService = Mockito.mock(classOf[SeamlessDocsService])
  val mockFormConfigManager: FormConfigManager = Mockito.mock(classOf[FormConfigManager])
  val mockFormDao: FormDAO = Mockito.mock(classOf[FormDAO])
  val mockUserDao: UserDAO = Mockito.mock(classOf[UserDAO])
  val mockReactiveMongoApi: ReactiveMongoApi = Mockito.mock(classOf[ReactiveMongoApi])

  class FakeModule extends AbstractModule with ScalaModule {
    def configure(): Unit = {
      bind[Environment[DefaultEnv]].toInstance(env)
      bind[SeamlessDocsService].toInstance(mockSeamlessDocsService)
      bind[FormConfigManager].toInstance(mockFormConfigManager)
      bind[FormDAO].toInstance(mockFormDao)
      bind[UserDAO].toInstance(mockUserDao)
      bind[ReactiveMongoApi].toInstance(new FakeReactiveMongoApi())
    }
  }

  override lazy val application: Application = GuiceApplicationBuilder()
    .configure(Configuration(ConfigFactory.load("application.test.conf")))
    .disable(classOf[JobModule])
    .overrides(new FakeModule)
    .build()

}

class SeamlessDocsDocumentServiceSpec extends PlaySpecification {
  sequential

  "The SeamlessDocsDocumentService.render method" should {
    "work if the form already has an application id" in new SeamplessDocsServiceTestContext {

      Mockito.when(mockFormDao.save(
        Matchers.eq(testFormWithExternal.userID),
        Matchers.eq(testFormWithExternal.claimID),
        Matchers.eq(testFormWithExternal.key),
        Matchers.argThat(new HasCorrectApplicationId(fakeApplicationCreateResponse.application_id))
      ))
        .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

      Mockito.when(mockSeamlessDocsService.formSubmit(
        Matchers.eq(testFormWithExternal.externalFormId.get),
        Matchers.any()
      ))
        .thenReturn(Future.successful(
          Left(SeamlessApplicationCreateResponse(result = true, "app_id", "description"))
        ))
      Mockito.when(mockSeamlessDocsService.updatePdf(
        Matchers.eq("app_id")
      ))
        .thenReturn(Future.successful(Left(new URL(pdfUrl))))

      private val fakeMap: Map[String, FormConfig] = Mockito.mock(classOf[Map[String, FormConfig]])
      Mockito.when(fakeMap.apply(Matchers.any()))
        .thenReturn(fakeFormConfig)
      Mockito.when(mockFormConfigManager.getFormConfigs)
        .thenReturn(fakeMap)

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val service = app.injector.instanceOf[SeamlessDocsDocumentService]

          service.render(testFormWithExternal).onComplete {
            case Success(bytes) => bytes must be equalTo fakePdf
            case Failure(_) => failure
          }
        })
      }
    }

    "not work if formSubmit fails" in new SeamplessDocsServiceTestContext {
      Mockito.when(mockFormDao.save(
        Matchers.eq(testFormWithExternal.userID),
        Matchers.eq(testFormWithExternal.claimID),
        Matchers.eq(testFormWithExternal.key),
        Matchers.argThat(new HasCorrectApplicationId(fakeApplicationCreateResponse.application_id))
      ))
        .thenReturn(Future.successful(UpdateWriteResult(ok = false, 1, 1, Seq(), Seq(), None, None, None)))

      Mockito.when(mockSeamlessDocsService.updatePdf(
        Matchers.eq(testFormWithExternal.externalApplicationId.get)
      ))
        .thenReturn(Future.successful(Left(new URL(pdfUrl))))
      Mockito.when(mockSeamlessDocsService.formSubmit(Matchers.any(), Matchers.any()))
        .thenReturn(Future.successful(Right(SeamlessErrorResponse(error = true, Seq()))))

      private val fakeMap: Map[String, FormConfig] = Mockito.mock(classOf[Map[String, FormConfig]])
      Mockito.when(fakeMap.apply(Matchers.any()))
        .thenReturn(fakeFormConfig)
      Mockito.when(mockFormConfigManager.getFormConfigs)
        .thenReturn(fakeMap)

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>

          val service = app.injector.instanceOf[SeamlessDocsDocumentService]

          service.render(testFormWithExternal).onComplete {
            case Success(_) => ko
            case Failure(_) => ok
          }
        })
      }
    }
  }

  "The SeamlessDocsDocumentService.renderSigned method" should {
    "work if the form already has an application id" in new SeamplessDocsServiceTestContext {
      Mockito.when(mockSeamlessDocsService.updatePdf(
        Matchers.eq("id")
      ))
        .thenReturn(Future.successful(Left(new URL(pdfUrl))))

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val service = app.injector.instanceOf[SeamlessDocsDocumentService]

          Await.result(service.renderSigned(testFormWithExternal), Duration.Inf) match {
            case url: URL => url must be equalTo new URL(pdfUrl)
            case _ => failure
          }
        })
      }
    }

    "fail if the form does not have an application id" in new SeamplessDocsServiceTestContext {
      Mockito.when(mockSeamlessDocsService.updatePdf(
        Matchers.eq("app_id")
      ))
        .thenReturn(Future.successful(Left(new URL(pdfUrl))))

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val service = app.injector.instanceOf[SeamlessDocsDocumentService]

          service.renderSigned(testForm) must throwA[RuntimeException]
        })
      }
    }
  }

  "The SeamlessDocsDocumentService.signatureLink method" should {
    "work if the form does not already have an application id" in new SeamplessDocsServiceTestContext {
      Mockito.when(mockFormDao.save(
        Matchers.eq(testForm.userID),
        Matchers.eq(testForm.claimID),
        Matchers.eq(testForm.key),
        Matchers.argThat(new HasCorrectApplicationId(fakeApplicationCreateResponse.application_id))
      ))
        .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

      Mockito.when(mockUserDao.find(Matchers.eq(identity.userID)))
        .thenReturn(Future.successful(Some(identity)))

      Mockito.when(mockSeamlessDocsService.formPrepare(
        Matchers.eq(fakeApplicationCreateResponse.application_id),
        Matchers.eq(identity.fullName.get),
        Matchers.eq(identity.email.get),
        Matchers.any(),
        Matchers.eq(testForm.responses)
      ))
        .thenReturn(Future.successful(Left(SeamlessApplicationCreateResponse(result = true, "appId", "Mock app."))))
      Mockito.when(mockSeamlessDocsService.getInviteUrl(
        Matchers.eq(fakeApplicationCreateResponse.application_id)
      ))
        .thenReturn(Future.successful(new URL(inviteUrl)))

      private val fakeMap: Map[String, FormConfig] = Mockito.mock(classOf[Map[String, FormConfig]])
      Mockito.when(fakeMap.apply(Matchers.any()))
        .thenReturn(fakeFormConfig)
      Mockito.when(mockFormConfigManager.getFormConfigs)
        .thenReturn(fakeMap)

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val service = app.injector.instanceOf[SeamlessDocsDocumentService]

          service.signatureLink(testForm).onComplete {
            case Success(url) => url must be equalTo new URL(inviteUrl)
            case Failure(_) => failure
          }
        })
      }

    }
    "work if the form already has an application id" in new SeamplessDocsServiceTestContext {
      Mockito.when(mockFormDao.save(
        Matchers.eq(testFormWithExternal.userID),
        Matchers.eq(testFormWithExternal.claimID),
        Matchers.eq(testFormWithExternal.key),
        Matchers.argThat(new HasCorrectApplicationId(fakeApplicationCreateResponse.application_id))
      ))
        .thenReturn(Future.successful(UpdateWriteResult(ok = true, 1, 1, Seq(), Seq(), None, None, None)))

      Mockito.when(mockSeamlessDocsService.formPrepare(
        Matchers.eq(fakeApplicationCreateResponse.application_id),
        Matchers.eq(identity.fullName.get),
        Matchers.eq(identity.email.get),
        Matchers.any(),
        Matchers.eq(testFormWithExternal.responses)
      ))
        .thenReturn(Future.successful(Left(SeamlessApplicationCreateResponse(result = true, "appId", "Mock app."))))

      Mockito.when(mockSeamlessDocsService.getInviteUrl(
        Matchers.eq(fakeApplicationCreateResponse.application_id)
      ))
        .thenReturn(Future.successful(new URL(inviteUrl)))

      private val fakeMap: Map[String, FormConfig] = Mockito.mock(classOf[Map[String, FormConfig]])
      Mockito.when(fakeMap.apply(Matchers.any()))
        .thenReturn(fakeFormConfig)
      Mockito.when(mockFormConfigManager.getFormConfigs)
        .thenReturn(fakeMap)

      new WithApplication(application) {
        withTestClient(app)(fakeController)({ client: WSClient =>
          val service = app.injector.instanceOf[SeamlessDocsDocumentService]

          service.signatureLink(testFormWithExternal).onComplete {
            case Success(url) => url must be equalTo new URL(inviteUrl)
            case Failure(_) => failure
          }
        })
      }
    }
  }
}
