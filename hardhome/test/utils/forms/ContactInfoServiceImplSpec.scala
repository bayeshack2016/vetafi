package utils.forms

import com.typesafe.config.ConfigFactory
import models.UserValues
import modules.JobModule
import org.specs2.mock.Mockito
import play.api.Configuration
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json.JsString
import play.api.test.{ PlaySpecification, WithApplication }
import reactivemongo.api.commands.WriteResult
import services.forms.ContactInfoServiceImpl

import scala.concurrent.duration.Duration
import scala.concurrent.{ Await, Future }

class ContactInfoServiceImplSpec extends PlaySpecification with Mockito {
  sequential

  "The ClaimInfoServiceImpl" should {

    "choose #1 priority mapping if both present" in new ContactInfoServiceTestContext {
      new WithApplication(application) {
        val contactInfoService: ContactInfoServiceImpl = app.injector.instanceOf[ContactInfoServiceImpl]

        contactInfoService.updateUserInfo(
          identity,
          UserValues(
            identity.userID,
            Map("attr1_1" -> JsString("a"), "attr2_1" -> JsString("b"),
              "attr1_2" -> JsString("y"), "attr2_2" -> JsString("z"))
          ),
          testMapping
        )

        identity.firstName.get must be equalTo "a b"
      }
    }

    "choose #2 priority mapping if #1 absent" in new ContactInfoServiceTestContext {
      new WithApplication(application) {
        val contactInfoService: ContactInfoServiceImpl = app.injector.instanceOf[ContactInfoServiceImpl]

        contactInfoService.updateUserInfo(
          identity,
          UserValues(
            identity.userID,
            Map(
              "attr1_2" -> JsString("y"), "attr2_2" -> JsString("z")
            )
          ),
          testMapping
        )

        identity.firstName.get must be equalTo "y z"
      }
    }

    "do nothing if not all attrs present" in new ContactInfoServiceTestContext {
      new WithApplication(application) {
        val contactInfoService: ContactInfoServiceImpl = app.injector.instanceOf[ContactInfoServiceImpl]

        identity = identity.copy(firstName = Some("unchanged"))

        contactInfoService.updateUserInfo(
          identity,
          UserValues(
            identity.userID,
            Map("attr1_1" -> JsString("a"))
          ),
          testMapping
        )

        identity.firstName.get must be equalTo "unchanged"
      }
    }

    "do nothing if no attrs present" in new ContactInfoServiceTestContext {
      new WithApplication(application) {
        val contactInfoService: ContactInfoServiceImpl = app.injector.instanceOf[ContactInfoServiceImpl]

        identity = identity.copy(firstName = Some("unchanged"))

        contactInfoService.updateUserInfo(
          identity,
          UserValues(
            identity.userID,
            Map()
          ),
          testMapping
        )

        identity.firstName.get must be equalTo "unchanged"
      }
    }

    "update user (interface smoketest)" in new ContactInfoServiceTestContext {
      new WithApplication(application) {
        val contactInfoService: ContactInfoServiceImpl = app.injector.instanceOf[ContactInfoServiceImpl]

        identity = identity.copy(firstName = Some("unchanged"))

        val future: Future[WriteResult] = contactInfoService.updateUserInfo(
          identity.userID,
          UserValues(
            identity.userID,
            Map("veteran_first_name" -> JsString("joe"))
          )
        )

        Await.result(future, Duration.Inf).ok must beTrue

        identity.firstName.get must be equalTo "joe"
      }
    }
  }
}
