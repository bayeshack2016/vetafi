package services.ratings

import java.util

import com.google.inject.Inject
import models.RatingCategory
import play.Configuration
import play.api.Logger
import play.api.libs.json.{ JsResult, Json }

import scala.collection.JavaConversions._

/**
 * RatingsConfigManager backed by JSON files in the project resources.
 */
class JsonResourceRatingsConfigManager @Inject() (configuration: Configuration) extends RatingsConfigManager {

  def loadRatingCategoryFromResource(ratingCategory: String): RatingCategory = {
    val inputStream = getClass.getClassLoader.getResource(
      s"${configuration.getString("ratings.dir")}/${ratingCategory}.json"
    ).openStream()
    val result: JsResult[RatingCategory] = Json.parse(inputStream).validate[RatingCategory]

    result.fold(
      errors => {
        val msg = s"Errors while parsing form config JSON at ${configuration.getString("ratings.dir")}/$ratingCategory: ${errors.toString}"
        Logger.error(msg)
        throw new RuntimeException(msg)
      },
      formConfig => {
        formConfig
      }
    )
  }

  lazy val ratingsConfigs: Map[String, RatingCategory] = {
    val enabledForms: util.List[String] = configuration.getStringList("ratings.enabled")
    enabledForms.map(
      (formKey: String) => {
        (formKey, loadRatingCategoryFromResource(formKey))
      }
    ).toMap
  }

  override def getRatingsConfigs: Map[String, RatingCategory] = ratingsConfigs
}
