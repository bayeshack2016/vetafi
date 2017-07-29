package services

import javax.inject.Inject

import models.{ User, UserValues }
import play.api.libs.json.JsString

class UserValuesServiceImpl @Inject() extends UserValuesService {

  override def updateUserValues(user: User, userValues: UserValues): UserValues = {

    userValues.copy(values = userValues.values ++ Map("contact_email" -> JsString(user.email.get)))
  }
}
