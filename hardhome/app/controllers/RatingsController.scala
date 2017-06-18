package controllers

import javax.inject.Inject

import play.api.mvc.{ Action, AnyContent, Controller }
import services.ratings.RatingsConfigManager

/**
 *
 */
class RatingsController @Inject() (val ratingsConfigManager: RatingsConfigManager) extends Controller {

  def index: Action[AnyContent] = Action {
    request =>
      Ok(views.html.ratings.layout(
        views.html.ratings.main(ratingsConfigManager.getRatingsConfigs)
      ))
  }
}
