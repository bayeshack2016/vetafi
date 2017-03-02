package models.daos

import java.util.UUID

import models.Claim
import reactivemongo.api.commands.WriteResult

import scala.concurrent.Future

/**
  * Created by jeffquinn on 3/2/17.
  */
trait ClaimDAO {
  def findClaims(userID: UUID): Future[Seq[Claim]]
  def findClaim(userID: UUID, claimID: UUID): Future[Seq[Claim]]
  def create(userID: UUID, forms: Seq[String]): Future[WriteResult]
}
