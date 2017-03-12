package utils.seamlessdocs

import java.util.{Date, UUID}
import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac
import org.apache.commons.codec.binary.Hex

import play.api.libs.ws.WSRequest

/**
  * Utilities for signing requests.
  */
object RequestUtils {

  def generateRequestSignature(requestMethod: String, uri: String, timestamp: Long, nonce: String, apiSecret: Array[Byte]): String = {
    val secret = new SecretKeySpec(apiSecret, "HmacSHA256")
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(secret)
    val hashBytes = mac.doFinal(s"$requestMethod+$uri+$timestamp+$nonce".getBytes)
    Hex.encodeHex(hashBytes).toString
  }

  def sign(request: WSRequest, apiKey: String, secretKey: Array[Byte]): WSRequest = {
    val epochTime: Long = System.currentTimeMillis() / 1000
    val nonce: String = UUID.randomUUID().toString

    val signature: String = generateRequestSignature(
      request.method,
      request.uri.getPath,
      epochTime,
      nonce,
      secretKey)

    request.withHeaders(
      "Date" -> epochTime.toString,
      "Authorization" -> s"HMAC-SHA256 api_key=$apiKey nonce=$nonce signature=$signature")
  }
}
