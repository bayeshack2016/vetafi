package services

import java.util.UUID

import com.mohiva.play.silhouette.api.LoginInfo
import models.{User, UserValues}
import play.api.libs.json.JsString
import play.api.test.PlaySpecification

class UserValuesServiceImplSpec extends PlaySpecification {
  sequential

  "The updateUserValues method" should {
    "Populate user email into contact email" in {
      val userValueService = new UserValuesServiceImpl()
      var fakeUser = User(
        userID = UUID.randomUUID(),
        loginInfo = LoginInfo("xxx", "xxx"),
        firstName = None,
        lastName = None,
        fullName = None,
        email = Some("user@website.com"),
        avatarURL = None,
        activated = true,
        contact = None
      )

      val updatedValues = userValueService.updateUserValues(
        fakeUser, UserValues(fakeUser.userID, Map())
      )

      updatedValues.values must be equalTo Map("contact_email" -> JsString("user@website.com"))
    }
  }
}
