package services.ratings
import models.UserRating


class RatingsCalculationServiceImpl extends RatingCalculationService {
  override def calculateTotalRating(userRating: UserRating): UserRating = {
    val newTotalRating: Int = userRating.ratings.map(_.rating).sortBy(identity).foldRight(0) {
      (left, right) =>
        ((100 / (100 - left)) * right) + left
    }
    userRating.copy(total_score = newTotalRating)
  }
}
