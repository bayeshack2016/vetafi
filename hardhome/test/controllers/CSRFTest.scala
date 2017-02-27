package controllers

import play.api.Application
import play.api.test.FakeRequest
import play.filters.csrf.CSRF.Token
import play.filters.csrf.{ CSRFConfigProvider, CSRFFilter }

import scala.language.postfixOps

trait CSRFTest {
  def addToken[T](fakeRequest: FakeRequest[T])(implicit app: Application): FakeRequest[T] = {
    val csrfConfig = app.injector.instanceOf[CSRFConfigProvider].get
    val csrfFilter = app.injector.instanceOf[CSRFFilter]
    val token = csrfFilter.tokenProvider.generateToken

    fakeRequest.copyFakeRequest(tags = fakeRequest.tags ++ Map(
      Token.NameRequestTag -> csrfConfig.tokenName,
      Token.RequestTag -> token
    )).withHeaders((csrfConfig.headerName, token))
  }
}
