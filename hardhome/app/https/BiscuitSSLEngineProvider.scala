package https

import java.io.ByteArrayInputStream
import java.security.KeyStore
import javax.net.ssl._

import play.Logger
import play.core.ApplicationProvider
import play.server.api._
import utils.secrets.SecretsManager

class BiscuitSSLEngineProvider(
  appProvider: ApplicationProvider
) extends SSLEngineProvider {

  val secretsManager: SecretsManager = appProvider.current.get.injector.instanceOf[SecretsManager]

  def readPassword(): Array[Char] = {
    secretsManager.getSecretUtf8("prod::keystore-password").toCharArray
  }

  def readKeyInputStream(): java.io.InputStream = {
    new ByteArrayInputStream(secretsManager.getSecret("prod::keystore-file"))
  }

  def readTrustInputStream(): java.io.InputStream = {
    new ByteArrayInputStream(secretsManager.getSecret("prod::keystore-file"))
  }

  def readKeyManagers(): Array[KeyManager] = {
    Logger.info("Reading key managers..")
    val password = readPassword()
    val keyInputStream = readKeyInputStream()
    try {
      val keyStore: KeyStore = KeyStore.getInstance(KeyStore.getDefaultType)
      keyStore.load(keyInputStream, password)
      val kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm)
      kmf.init(keyStore, password)
      kmf.getKeyManagers
    } finally {
      keyInputStream.close()
    }
  }

  def readTrustManagers(): Array[TrustManager] = {
    Logger.info("Reading trust managers..")
    val password = readPassword()
    val trustInputStream = readTrustInputStream()
    try {
      val keyStore = KeyStore.getInstance(KeyStore.getDefaultType)
      keyStore.load(trustInputStream, password)
      val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm)
      tmf.init(keyStore)
      tmf.getTrustManagers
    } finally {
      trustInputStream.close()
    }
  }

  def createSSLContext(applicationProvider: ApplicationProvider): SSLContext = {
    Logger.info("Creating ssl context..")

    var keyManagers: Array[KeyManager] = null
    var trustManagers: Array[TrustManager] = null

    try {
      keyManagers = readKeyManagers()
    } catch {
      case e: Exception =>
        Logger.error("Failed to read key managers", e)
        throw new RuntimeException("Failed to read key managers", e)
    }

    try {
      trustManagers = readTrustManagers()
    } catch {
      case e: Exception =>
        Logger.error("Failed to read trustManagers managers", e)
        throw new RuntimeException("Failed to read trust managers", e)
    }

    Logger.info("Loaded managers..")

    // Configure the SSL context to use TLS
    val sslContext = SSLContext.getInstance("TLS")
    sslContext.init(keyManagers, trustManagers, null)
    sslContext
  }

  override def createSSLEngine(): SSLEngine = {
    val sslContext = createSSLContext(appProvider)

    // Start off with a clone of the default SSL parameters...
    val sslParameters = sslContext.getDefaultSSLParameters

    // Tells the server to ignore client's cipher suite preference.
    // http://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html#cipher_suite_preference
    sslParameters.setUseCipherSuitesOrder(true)

    // http://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html#SSLParameters
    val needClientAuth = java.lang.System.getProperty("play.ssl.needClientAuth")
    sslParameters.setNeedClientAuth(java.lang.Boolean.parseBoolean(needClientAuth))

    // Clone and modify the default SSL parameters.
    val engine = sslContext.createSSLEngine
    engine.setSSLParameters(sslParameters)

    Logger.info("returning engine")
    engine
  }

}
