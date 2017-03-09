package models.daos

import java.util.UUID

import models.Claim
import reactivemongo.api.commands.{ MultiBulkWriteResult, WriteResult }

import scala.concurrent.Future

trait ClaimDAO {
  def findClaims(userID: UUID): Future[Seq[Claim]]
  def findClaim(userID: UUID, claimID: UUID): Future[Option[Claim]]
  def findIncompleteClaim(userID: UUID): Future[Option[Claim]]
  def create(userID: UUID, forms: Seq[String]): Future[MultiBulkWriteResult]
  def submit(userID: UUID, claimID: UUID): Future[WriteResult]
}
