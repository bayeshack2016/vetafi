package services

import java.util.UUID
import javax.inject.Inject

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.impl.providers.CommonSocialProfile
import models.{ User, UserValues }
import models.daos.{ UserDAO, UserValuesDAO }
import play.api.libs.concurrent.Execution.Implicits._
import reactivemongo.api.commands.WriteResult
import services.forms.UserValuesService

import scala.concurrent.Future

/**
 * Handles actions to users.
 *
 * @param userDAO The user DAO implementation.
 */
class UserServiceImpl @Inject() (
  userDAO: UserDAO,
  userValuesDAO: UserValuesDAO,
  userValuesService: UserValuesService
) extends UserService {

  /**
   * Retrieves a user that matches the specified ID.
   *
   * @param id The ID to retrieve a user.
   * @return The retrieved user or None if no user could be retrieved for the given ID.
   */
  def retrieve(id: UUID): Future[Option[User]] = userDAO.find(id)

  /**
   * Retrieves a user that matches the specified login info.
   *
   * @param loginInfo The login info to retrieve a user.
   * @return The retrieved user or None if no user could be retrieved for the given login info.
   */
  def retrieve(loginInfo: LoginInfo): Future[Option[User]] = userDAO.find(loginInfo)

  /**
   * Saves a user, also updates their user values based on their user information.
   *
   * @param user The user to save.
   * @return The saved user.
   */
  def save(user: User): Future[User] = {
    userDAO.save(user).flatMap {
      case ok if ok.ok =>
        userValuesDAO.find(user.userID).map {
          case Some(values) =>
            userValuesService.updateUserValues(user, values)
          case None =>
            userValuesService.updateUserValues(user, UserValues(user.userID, Map()))
        }.flatMap(
          updatedValues =>
            userValuesDAO.update(user.userID, updatedValues.values).flatMap {
              case userValuesUpdate if userValuesUpdate.ok =>
                Future.successful(user)
              case _ => throw new RuntimeException
            }
        )
      case _ => throw new RuntimeException
    }
  }

  /**
   * Saves the social profile for a user.
   *
   * If a user exists for this profile then update the user, otherwise create a new user with the given profile.
   *
   * @param profile The social profile to save.
   * @return The user for whom the profile was saved.
   */
  override def save(profile: CommonSocialProfile): Future[User] = {
    userDAO.find(profile.loginInfo).flatMap {
      case Some(user) => // Update user with profile
        userDAO.save(user.copy(
          firstName = profile.firstName,
          lastName = profile.lastName,
          fullName = profile.fullName,
          email = profile.email,
          avatarURL = profile.avatarURL
        )).flatMap(_ => userDAO.find(user.userID))
          .flatMap((saved: Option[User]) => {
            Future.successful(saved.get)
          })
      case None => // Insert a new user
        val id = UUID.randomUUID()
        userDAO.save(User(
          userID = id,
          loginInfo = profile.loginInfo,
          firstName = profile.firstName,
          lastName = profile.lastName,
          fullName = profile.fullName,
          email = profile.email,
          avatarURL = profile.avatarURL,
          activated = true,
          contact = None
        )).flatMap(_ => userDAO.find(id))
          .flatMap((saved: Option[User]) => {
            Future.successful(saved.get)
          })
    }
  }
}
