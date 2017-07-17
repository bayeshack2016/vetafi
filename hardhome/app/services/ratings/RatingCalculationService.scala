package services.ratings

import models.UserRating


trait RatingCalculationService {

  def calculateTotalRating(userRating: UserRating): UserRating
}
