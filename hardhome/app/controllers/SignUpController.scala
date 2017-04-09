package controllers

import java.util.UUID
import java.util.concurrent.TimeUnit
import javax.inject.Inject

import com.mohiva.play.silhouette.api._
import com.mohiva.play.silhouette.api.repositories.AuthInfoRepository
import _root_.services.{ AuthTokenService, UserService }
import com.mohiva.play.silhouette.api.services.AvatarService
import com.mohiva.play.silhouette.api.util.{ Clock, PasswordHasherRegistry, PasswordInfo }
import com.mohiva.play.silhouette.impl.providers._
import forms.VetafiSignUpForm
import models.User
import play.api.Configuration
import play.api.i18n.{ I18nSupport, Messages, MessagesApi }
import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc.{ Action, AnyContent, Controller }
import utils.auth.DefaultEnv

import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration

/**
 * The `Sign Up` controller.
 *
 * @param messagesApi            The Play messages API.
 * @param silhouette             The Silhouette stack.
 * @param userService            The user service implementation.
 * @param authInfoRepository     The auth info repository implementation.
 * @param authTokenService       The auth token service implementation.
 * @param avatarService          The avatar service implementation.
 * @param passwordHasherRegistry The password hasher registry.
 */
class SignUpController @Inject() (
  val messagesApi: MessagesApi,
  silhouette: Silhouette[DefaultEnv],
  userService: UserService,
  authInfoRepository: AuthInfoRepository,
  authTokenService: AuthTokenService,
  avatarService: AvatarService,
  passwordHasherRegistry: PasswordHasherRegistry,
  configuration: Configuration,
  clock: Clock
)
  extends Controller with I18nSupport {

  /**
   * Views the `Sign Up` page.
   *
   * @return The result to display.
   */
  def view: Action[AnyContent] = silhouette.UnsecuredAction.async { implicit request =>
    Future.successful(Ok(
      views.html.authLayout(
        "signup-view",
        ""
      )(
          views.html.signupForm(routes.SocialAuthController.authenticate("idme").url)
        )
    ))
  }

  def maybeCreateUser(loginInfo: LoginInfo, data: VetafiSignUpForm.Data): Future[Option[User]] = {
    userService.retrieve(loginInfo).flatMap {
      case Some(user) => Future.successful(None)
      case None =>
        val authInfo: PasswordInfo = passwordHasherRegistry.current.hash(data.password)
        val newUser = User(
          userID = UUID.randomUUID(),
          loginInfo = loginInfo,
          firstName = None,
          lastName = None,
          fullName = None,
          email = Some(data.email),
          avatarURL = None,
          activated = true,
          contact = None
        )
        userService.save(newUser).map((u) => {
          Some(u)
        })
    }
  }

  /**
   * Handles the submitted form.
   *
   * @return The result to display.
   */
  def submit: Action[AnyContent] = silhouette.UnsecuredAction.async { implicit request =>
    VetafiSignUpForm.form.bindFromRequest.fold(
      error => Future.successful(BadRequest(error.errorsAsJson)),
      data => {
        val loginInfo = LoginInfo(CredentialsProvider.ID, data.email)
        userService.retrieve(loginInfo).flatMap {
          case Some(_) =>
            Future.successful(Redirect(routes.GulpAssets.index()))
          case None =>
            val authInfo = passwordHasherRegistry.current.hash(data.password)
            val user = User(
              userID = UUID.randomUUID(),
              loginInfo = loginInfo,
              firstName = None,
              lastName = None,
              fullName = None,
              email = Some(data.email),
              avatarURL = None,
              activated = true,
              contact = None
            )

            userService.save(user).flatMap {
              val expirationDateTime = clock.now.withDurationAdded(
                configuration.getMilliseconds("silhouette.authenticator.rememberMe.authenticatorExpiry").get,
                1
              )
              val idleTimeout = Some(FiniteDuration(
                configuration.getMilliseconds("silhouette.authenticator.rememberMe.authenticatorIdleTimeout").get,
                TimeUnit.MILLISECONDS
              ))
              val cookieMaxAge = Some(FiniteDuration(
                configuration.getMilliseconds("silhouette.authenticator.rememberMe.authenticatorIdleTimeout").get,
                TimeUnit.MILLISECONDS
              ))

              user =>
                silhouette.env.eventBus.publish(SignUpEvent(user, request))
                silhouette.env.authenticatorService.create(loginInfo).map {
                  authenticator =>
                    authenticator.copy(
                      expirationDateTime = expirationDateTime,
                      idleTimeout = idleTimeout,
                      cookieMaxAge = cookieMaxAge
                    )
                }.flatMap { authenticator =>
                  silhouette.env.eventBus.publish(LoginEvent(user, request))
                  silhouette.env.authenticatorService.init(authenticator).flatMap { v =>
                    silhouette.env.authenticatorService.embed(v, Redirect(routes.GulpAssets.index()))
                  }
                }
            }
        }
      }
    )
  }
}
