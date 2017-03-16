package services.submission

import models.{Claim, ClaimSubmission}

import scala.concurrent.Future

/**
  * Service for the physical submission of a claim object.
  *
  * Could be implemented using lob.com print/mail or a eFax API
  */
trait SubmissionService {


  def submit(claim: Claim): Future[ClaimSubmission]
}
