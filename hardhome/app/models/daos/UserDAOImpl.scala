package models.daos

import java.util.UUID
import javax.inject._

import com.mohiva.play.silhouette.api.LoginInfo
import models.User

import play.api.libs.json._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import reactivemongo.api._
import play.modules.reactivemongo.json._
import play.modules.reactivemongo._
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection

/**
 * Give access to the user object.
 */
class UserDAOImpl @Inject() (val reactiveMongoApi: ReactiveMongoApi) extends UserDAO {

  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("silhouette.user"))

  /**
   * Finds a user by its login info.
   *
   * @param loginInfo The login info of the user to find.
   * @return The found user or None if no user for the given login info could be found.
   */
  def find(loginInfo: LoginInfo): Future[Option[User]] = {
    val query = Json.obj("loginInfo" -> loginInfo)
    collection.flatMap(_.find(query).one[User])
  }

  /**
   * Finds a user by its user ID.
   *
   * @param userID The ID of the user to find.
   * @return The found user or None if no user for the given ID could be found.
   */
  def find(userID: UUID): Future[Option[User]] = {
    val query = Json.obj("userID" -> userID.toString)
    collection.flatMap(_.find(query).one[User])
  }

  /**
   * Saves a user.
   *
   * @param user The user to save.
   * @return The saved user.
   */
  def save(user: User): Future[WriteResult] = {
    collection.flatMap(_.update(Json.obj("userID" -> user.userID), user, upsert = true))
  }

  /**
   * Update a users contact information
   *
   * @param user The user object with the new information.
   * @return WriteResult
   */
  override def updateContactInfo(user: User): Future[WriteResult] = {
    collection.flatMap(
      _.update(Json.obj("userID" -> user.userID.toString), Json.obj("$set" -> Json.toJson(user.contact)))
    )
  }

  /**
   * Set a user account to inactive.
   *
   * @param user The user account to delete.
   * @return WriteResult
   */
  override def setInactive(user: User): Future[WriteResult] = {
    collection.flatMap(
      _.update(Json.obj("userID" -> user.userID.toString), Json.obj("$set" -> Json.obj("activated" -> false)))
    )
  }
}

