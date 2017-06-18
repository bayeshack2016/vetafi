package services.ratings

import models.RatingCategory

/**
 * Read in the configurations that generate the ratings calculator pages.
 */
trait RatingsConfigManager {
  def getRatingsConfigs: Map[String, RatingCategory]
}
