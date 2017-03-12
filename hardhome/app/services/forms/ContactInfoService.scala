package services.forms

import java.util.UUID

import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait ContactInfoService {
  def updateContactInfo(userID: UUID): Future[Option[WriteResult]]
}
