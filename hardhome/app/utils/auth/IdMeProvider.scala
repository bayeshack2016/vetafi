package utils.auth

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.api.util.HTTPLayer
import com.mohiva.play.silhouette.impl.exceptions.ProfileRetrievalException
import com.mohiva.play.silhouette.impl.providers.{ CommonSocialProfile, CommonSocialProfileBuilder, OAuth2Info, OAuth2Provider, OAuth2Settings, OAuth2StateProvider, SocialProfileParser, _ }
import play.api.Logger
import play.api.libs.json.{ JsObject, JsValue }

import scala.concurrent.Future

/**
 * Base IdMe OAuth2 Provider.
 *
 * @see https://developers.IdMe.com/tools/explorer
 * @see https://developers.IdMe.com/docs/graph-api/reference/user
 * @see https://developers.IdMe.com/docs/IdMe-login/access-tokens
 */
trait BaseIdMeProvider extends OAuth2Provider {

  /**
   * The content type to parse a profile from.
   */
  override type Content = JsValue

  /**
   * The provider ID.
   */
  override val id = IdMeProvider.ID

  /**
   * Defines the URLs that are needed to retrieve the profile data.
   */
  override protected val urls = Map("api" -> settings.apiURL.getOrElse(IdMeProvider.API))

  /**
   * Builds the social profile.
   *
   * @param authInfo The auth info received from the provider.
   * @return On success the build social profile, otherwise a failure.
   */
  override protected def buildProfile(authInfo: OAuth2Info): Future[Profile] = {
    Logger.info(s"Building profile with ${authInfo.toString} and ${authInfo.accessToken}")
    httpLayer.url(urls("api").format(authInfo.accessToken)).get().flatMap { response =>
      val json = response.json
      (json \ "error").asOpt[JsObject] match {
        case Some(error) =>
          val errorMsg = (error \ "message").as[String]
          val errorType = (error \ "type").as[String]
          val errorCode = (error \ "code").as[Int]

          throw new ProfileRetrievalException(IdMeProvider.SpecifiedProfileError.format(id, errorMsg, errorType, errorCode))
        case _ => profileParser.parse(json, authInfo)
      }
    }
  }
}

/**
 * The profile parser for the common social profile.
 */
class IdMeProfileParser extends SocialProfileParser[JsValue, CommonSocialProfile, OAuth2Info] {

  /**
   * Parses the social profile.
   *
   * @param json     The content returned from the provider.
   * @param authInfo The auth info to query the provider again for additional data.
   * @return The social profile from given result.
   */
  override def parse(json: JsValue, authInfo: OAuth2Info) = Future.successful {
    val userID = (json \ "id").as[String]
    val firstName = (json \ "fname").asOpt[String]
    val lastName = (json \ "lname").asOpt[String]
    val email = (json \ "email").asOpt[String]

    CommonSocialProfile(
      loginInfo = LoginInfo(IdMeProvider.ID, userID),
      firstName = firstName,
      lastName = lastName,
      email = email
    )
  }
}

/**
 * The IdMe OAuth2 Provider.
 *
 * @param httpLayer     The HTTP layer implementation.
 * @param stateProvider The state provider implementation.
 * @param settings      The provider settings.
 */
class IdMeProvider(
  protected val httpLayer: HTTPLayer,
  protected val stateProvider: OAuth2StateProvider,
  val settings: OAuth2Settings
)
  extends BaseIdMeProvider with CommonSocialProfileBuilder {

  /**
   * The type of this class.
   */
  override type Self = IdMeProvider

  /**
   * The profile parser implementation.
   */
  override val profileParser = new IdMeProfileParser

  /**
   * Gets a provider initialized with a new settings object.
   *
   * @param f A function which gets the settings passed and returns different settings.
   * @return An instance of the provider initialized with new settings.
   */
  override def withSettings(f: (Settings) => Settings) = new IdMeProvider(httpLayer, stateProvider, f(settings))
}

/**
 * The companion object.
 */
object IdMeProvider {

  /**
   * The error messages.
   */
  val SpecifiedProfileError = "[Silhouette][%s] Error retrieving profile information. Error message: %s, type: %s, code: %s"

  /**
   * The IdMe constants.
   */
  val ID = "idme"
  val API = "https://api.id.me/api/public/v2/attributes.json?access_token=%s"
}
