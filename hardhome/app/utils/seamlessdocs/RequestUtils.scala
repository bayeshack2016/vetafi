package utils.seamlessdocs

import java.time.Clock
import java.util.{ Date, UUID }
import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac

import org.apache.commons.codec.binary.Hex
import play.api.libs.ws.WSRequest

/**
 * Utilities for signing requests.
 */
class RequestUtils(clock: Clock) {

  def generateRequestSignature(requestMethod: String, uri: String, timestamp: Long, nonce: String, apiSecret: Array[Byte]): String = {
    val secret = new SecretKeySpec(apiSecret, "HmacSHA256")
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(secret)
    val hashBytes = mac.doFinal(s"$requestMethod+$uri+$timestamp+$nonce".getBytes)
    new String(Hex.encodeHex(hashBytes))
  }

  def sign(
    request: WSRequest,
    apiKey: String,
    secretKey: Array[Byte],
    nonceOption: Option[String] = None
  ): WSRequest = {
    val epochTime: Long = clock.millis() / 1000

    val nonce: String = nonceOption match {
      case Some(someNonce) => someNonce
      case _ => UUID.randomUUID().toString
    }

    val signature: String = generateRequestSignature(
      request.method,
      request.uri.getPath.stripPrefix("/api"),
      epochTime,
      nonce,
      secretKey
    )

    request.withHeaders(
      "Date" -> epochTime.toString,
      "Authorization" -> s"HMAC-SHA256 api_key=$apiKey nonce=$nonce signature=$signature"
    )
  }
}
