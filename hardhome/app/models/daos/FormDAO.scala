package models.daos

import java.util.UUID

import models.{Form, UserValues}
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait FormDAO {

  /**
    * Finds form for a given users claim
    *
    * @param userID The ID of the user.
    * @param claimID The ID of the claim.
    * @param key The codename of the form
    * @return The found user values or None if no user for the given ID combo could be found.
    */
  def find(userID: UUID, claimID: UUID, key: String): Future[Option[Form]]
}
