package utils.seamlessdocs

import java.time.{ Clock, Instant, ZoneId }

import com.typesafe.config.ConfigFactory
import modules.JobModule
import play.api.Configuration
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.ws.{ WSClient, WSRequest }
import play.api.test.{ PlaySpecification, WithApplication }

class RequestUtilsSpec extends PlaySpecification {
  sequential

  "RequestUtils.generateRequestSignature" should {
    "return correct signature" in {
      val expectedSignature = "0cdba187c5a2ce12f732ccbdb12a0c4d82cf8930f1d6aedef58cb38dcf9c6919"
      val observedSignature = new RequestUtils(Clock.systemUTC()).generateRequestSignature(
        "POST",
        "/form/CO15021000011408891/elements",
        1425589564,
        "abc123",
        "uq7UKtK4NEBVqNPbHBTImuxxShp8ug".getBytes
      )

      observedSignature must be equalTo expectedSignature
    }
  }

  "RequestUtils.sign" should {
    "set correct headers" in new WithApplication(GuiceApplicationBuilder()
      .configure(Configuration(ConfigFactory.load("application.test.conf")))
      .disable(classOf[JobModule])
      .build()) {
      val client: WSClient = app.injector.instanceOf(classOf[WSClient])
      val request: WSRequest = client.url("https://xxx.seamlessdocs.com/api/form/CO15021000011408891/elements").withMethod("POST")
      val clock: Clock = Clock.fixed(Instant.ofEpochSecond(1425589564), ZoneId.of("UTC"))
      val requestUtils: RequestUtils = new RequestUtils(clock)

      val signed: WSRequest = requestUtils.sign(
        request,
        "apiKey",
        "uq7UKtK4NEBVqNPbHBTImuxxShp8ug".getBytes,
        Some("abc123")
      )

      signed.headers("Date") must be equalTo Seq(1425589564.toString)

      signed.headers("Authorization") must be equalTo Seq(
        "HMAC-SHA256" +
          " api_key=apiKey" +
          " nonce=abc123" +
          " signature=0cdba187c5a2ce12f732ccbdb12a0c4d82cf8930f1d6aedef58cb38dcf9c6919"
      )
    }
  }
}
