package services.forms

import java.util.UUID
import javax.inject.Inject

import models.daos.{UserDAO, UserValuesDAO}
import models.{Address, Contact, User, UserValues}
import play.api.libs.json._
import reactivemongo.api.commands.WriteResult
import utils.JsonUnbox

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
 * Service for updating user contact info from filled form questions.
 *
 * Example: If a form asks your address, we should populate the answered
 * address into the User.Contact.Address model.
 */
class ContactInfoServiceImpl @Inject() (
  userDAO: UserDAO,
  userValuesDAO: UserValuesDAO
) extends ContactInfoService {
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

  def getPreferredConcatenatedValue(keySets: Seq[Seq[String]], values: Map[String, JsValue]): Option[String] = {
    for (keys: Seq[String] <- keySets) {
      if (keys.map(values.contains).reduce(_ && _)) {
        return Some(
          JsonUnbox.unbox(keys.map(values.apply)
          .reduce(
            (a: JsValue, b: JsValue) => {
              JsString(JsonUnbox.unbox(a).toString + " " + JsonUnbox.unbox(b).toString)
            }
          )).toString
        )
      }
    }
    None
  }

  def updateUserInfo(
    user: User,
    values: UserValues,
    mapping: Map[(User, Option[String]) => User, Seq[Seq[String]]] = USER_VALUES_TO_USER_PROPERTIES_MAPPING
  ): Future[WriteResult] = {
    var updatedUser: User = user.copy()

    if (updatedUser.contact.isEmpty) {
      updatedUser = updatedUser.copy(contact = Some(Contact(None, Some(Address()))))
    }

    val finalUser: User = mapping.foldLeft(updatedUser)(
      (u: User, t: ((User, Option[String]) => User, Seq[Seq[String]])) => {
        getPreferredConcatenatedValue(t._2, values.values) match {
          case foundValue if foundValue.nonEmpty => t._1(u, foundValue)
          case _ => u
        }
      }
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

  override def updateContactInfo(userID: UUID): Future[Option[WriteResult]] = {
    userValuesDAO.find(userID).flatMap {
      case Some(userValues) => updateUserInfo(userID, userValues).map {
        Some(_)
      }
      case _ => Future.successful(None)
    }
  }
}
