package models.daos

import java.util.UUID

import models.{RatingSelection, UserRating}
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

trait UserRatingDAO {

  /**
   * Finds current user rating for a user by their userID.
   */
  def find(userID: UUID): Future[Option[UserRating]]

  /**
   * Add a new rating selection to the user's saved selections.
   */
  def addSelection(userID: UUID, selections: Seq[RatingSelection], totalScore: Int): Future[WriteResult]
}
