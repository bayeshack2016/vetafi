package models.daos

import java.util.UUID

import models.UserValues
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait UserValuesDAO {

  /**
   * Finds user values for a user by their userID.
   *
   * @param userID The ID of the user to find values for.
   * @return The found user values or None if no user for the given ID could be found.
   */
  def find(userID: UUID): Future[Option[UserValues]]

  /**
   *
   */
  def update(userID: UUID, values: UserValues): Future[WriteResult]

  /**
   *
   */
  def updateContactInfo(userID: UUID): Future[Option[WriteResult]]

}
