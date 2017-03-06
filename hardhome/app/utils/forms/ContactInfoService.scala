package utils.forms

import java.util.UUID

import models.UserValues
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait ContactInfoService {

  def updateUserInfo(userID: UUID, values: UserValues): Future[WriteResult]
}
