package utils.auth

import com.mohiva.play.silhouette.api.{Authenticator, Authorization}
import models.User
import play.api.mvc.Request

import scala.concurrent.Future

class AlwaysAuthorized[A <: Authenticator] extends Authorization[User, A] {
  override def isAuthorized[B](identity: User, authenticator: A)(implicit request: Request[B]): Future[Boolean] = {
    Future.successful(true)
  }
}
