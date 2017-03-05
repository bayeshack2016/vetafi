package models.daos

import java.util.UUID
import javax.inject.Inject

import models.{ Address, Contact, User, UserValues }
import play.api.libs.json.Json
import play.modules.reactivemongo.ReactiveMongoApi
import play.modules.reactivemongo.json._
import reactivemongo.api.commands.WriteResult
import reactivemongo.play.json.collection.JSONCollection
import play.api.libs.json._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class UserValuesDAOImpl @Inject() (
  val reactiveMongoApi: ReactiveMongoApi,
  val userDAO: UserDAO
) extends UserValuesDAO {

  def collection: Future[JSONCollection] = reactiveMongoApi.database.map(_.collection("user_values"))

  /**
   * Finds user values for a user by their userID.
   *
   * @param userID The ID of the user to find values for.
   * @return The found user values or None if no user for the given ID could be found.
   */
  override def find(userID: UUID): Future[Option[UserValues]] = {
    collection.flatMap {
      _.find(Json.obj("userID" -> userID.toString)).one[UserValues]
    }
  }

  /**
   * Update the [String, String] map of user values.
   *
   * @param values New user values, will overwrite existing values of the same key.
   */
  override def update(userID: UUID, values: UserValues): Future[WriteResult] = {
    collection.flatMap((userValuesCollection: JSONCollection) => {

      val userValuesOptionFuture: Future[Option[UserValues]] =
        userValuesCollection.find(Json.obj("userID" -> values.userID.toString)).one[UserValues]

      val existingValuesFuture: Future[Map[String, String]] = userValuesOptionFuture.map {
        case userValues if userValues.nonEmpty => userValues.get.values
        case _ => Map()
      }

      existingValuesFuture.flatMap((existingValues: Map[String, String]) => {
        userValuesCollection.update(
          Json.obj("userID" -> values.userID.toString),
          // The values on the RHS of `++` will overwrite the values of the LHS
          Json.obj("$set" -> Json.obj("values" -> Json.toJson(existingValues ++ values.values))),
          upsert = true
        )
      })
    })
  }

  override def updateContactInfo(userID: UUID): Future[Option[WriteResult]] = {
    collection.flatMap(_.find(Json.obj("userID" -> userID)).one[UserValues]).flatMap {
      case found if found.nonEmpty => updateUserInfo(userID, found.get).map {
        Some(_)
      }
      case _ => Future.successful(None)
    }
  }

  /**
   * This is a mapping of user value keys to User object properties
   * The keys and values are interpreted as JSON path strings
   */
  val USER_VALUES_TO_USER_PROPERTIES_MAPPING: Map[(User, Option[String]) => User, Seq[Seq[String]]] = Map(
    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(name = value)))))
    },
      Seq(
        Seq("veteran_first_name", "veteran_middle_initial", "veteran_last_name"),
        Seq("claimant_first_name", "claimant_middle_initial", "claimant_last_name")
      )),

    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(street1 = value)))))
    },
      Seq(Seq("veteran_home_address_line1"))),

    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(street2 = value)))))
    },
      Seq(Seq("veteran_home_address_line2"))),
    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(city = value)))))
    }, Seq(Seq("veteran_home_city"))),
    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(province = value)))))
    }, Seq(Seq("veteran_home_state"))),
    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(postal = value)))))
    }, Seq(Seq("veteran_home_zip_code"))),
    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(address =
        Some(user.contact.get.address.get.copy(country = value)))))
    }, Seq(Seq("veteran_home_country"))),
    ((user: User, value: Option[String]) => {
      user.copy(contact = Some(user.contact.get.copy(phoneNumber = value)))
    },
      Seq(Seq("contact_phone_number"))),
    ((user: User, value: Option[String]) => {
      user.copy(firstName = value)
    },
      Seq(Seq("veteran_first_name"), Seq("claimant_first_name"))),
    ((user: User, value: Option[String]) => {
      user.copy(lastName = value)
    },
      Seq(Seq("veteran_last_name"), Seq("claimant_last_name")))
  )

  def getPreferredConcatenatedValue(keySets: Seq[Seq[String]], values: UserValues): Option[String] = {
    for (keys: Seq[String] <- keySets) {
      if (keys.map(values.values.contains).reduce(_ && _)) {
        return Some(keys.map(values.values.apply).reduce(_ + " " + _))
      }
    }
    None
  }

  def updateUserInfo(user: User, values: UserValues): Future[WriteResult] = {
    var updatedUser: User = user.copy()

    if (updatedUser.contact.isEmpty) {
      updatedUser = updatedUser.copy(contact = Some(Contact(None, Some(Address()))))
    }

    val finalUser: User = USER_VALUES_TO_USER_PROPERTIES_MAPPING.foldLeft(updatedUser)(
      (u, t) =>
        t._1(u, getPreferredConcatenatedValue(t._2, values))
    )

    userDAO.save(finalUser)
  }

  def updateUserInfo(userID: UUID, values: UserValues): Future[WriteResult] = {
    userDAO.find(userID).flatMap {
      user =>
        {
          updateUserInfo(user.get, values)
        }
    }
  }
}
