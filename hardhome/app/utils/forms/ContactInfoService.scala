package utils.forms

import java.util.UUID

import models.UserValues
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait ContactInfoService {
  def updateContactInfo(userID: UUID): Future[Option[WriteResult]]
}
