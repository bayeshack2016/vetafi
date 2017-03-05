package models.daos

import java.util.UUID

import com.mohiva.play.silhouette.api.LoginInfo
import models.User
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

/**
 * Give access to the user object.
 */
trait UserDAO {

  /**
   * Finds a user by its login info.
   *
   * @param loginInfo The login info of the user to find.
   * @return The found user or None if no user for the given login info could be found.
   */
  def find(loginInfo: LoginInfo): Future[Option[User]]

  /**
   * Finds a user by its user ID.
   *
   * @param userID The ID of the user to find.
   * @return The found user or None if no user for the given ID could be found.
   */
  def find(userID: UUID): Future[Option[User]]

  /**
   * Saves a user.
   *
   * @param user The user to save.
   * @return The saved user.
   */
  def save(user: User): Future[WriteResult]

  /**
   * Update a users contact information
   *
   * @param user The user object with the new information.
   * @return WriteResult
   */
  def updateContactInfo(user: User): Future[WriteResult]

  /**
   * Set a user account to inactive.
   *
   * @param user The user account to delete.
   * @return WriteResult
   */
  def setInactive(user: User): Future[WriteResult]
}
