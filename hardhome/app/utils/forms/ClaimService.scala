package utils.forms

import models.ClaimForm

/**
  * Service providing logic related to forms and their data elements.
  */
trait ClaimService {

  def calculateProgress(claimForm: ClaimForm): ClaimForm
}
