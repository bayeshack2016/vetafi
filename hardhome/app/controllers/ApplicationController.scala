package controllers

import javax.inject.Inject

import com.mohiva.play.silhouette.api.actions.SecuredErrorHandler
import com.mohiva.play.silhouette.api.{ LogoutEvent, Silhouette }
import com.mohiva.play.silhouette.impl.providers.SocialProviderRegistry
import play.api.Configuration
import play.api.i18n.{ I18nSupport, MessagesApi }
import play.api.mvc.{ Action, AnyContent, Controller }
import utils.auth.{ DefaultEnv, RedirectSecuredErrorHandler }

import scala.concurrent.Future

/**
 * The basic application controller.
 *
 * @param messagesApi The Play messages API.
 * @param silhouette The Silhouette stack.
 * @param socialProviderRegistry The social provider registry.
 */
class ApplicationController @Inject() (
  val messagesApi: MessagesApi,
  silhouette: Silhouette[DefaultEnv],
  socialProviderRegistry: SocialProviderRegistry,
  redirectSecuredErrorHandler: RedirectSecuredErrorHandler,
  configuration: Configuration
)
  extends Controller with I18nSupport {

  /**
   * Handles the Sign Out action.
   *
   * @return The result to display.
   */
  def signOut: Action[AnyContent] = silhouette.SecuredAction(redirectSecuredErrorHandler).async { implicit request =>
    val result = Redirect(routes.GulpAssets.index())
    silhouette.env.eventBus.publish(LogoutEvent(request.identity, request))
    silhouette.env.authenticatorService.discard(request.authenticator, result)
  }

  def googleForm: Action[AnyContent] = silhouette.UnsecuredAction {
    implicit request =>
      Ok(views.html.googleForm(configuration.getString("google.formUrl")))
  }
}
