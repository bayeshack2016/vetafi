package utils.secrets

import java.io.InputStreamReader
import java.nio.charset.StandardCharsets

import com.amazonaws.auth.{ AWSCredentialsProvider, DefaultAWSCredentialsProviderChain }
import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.regions.{ Region, Regions }
import com.amazonaws.services.kms.{ AWSKMS, AWSKMSClient }
import com.amazonaws.util.EC2MetadataUtils
import com.google.inject.Inject
import com.wagmorelabs.biscuit.{ Biscuit, KeyManager, KmsKeyManager }
import play.{ Configuration, Logger }

/**
 * Secrets manager backed by https://github.com/dcoker/biscuit-java
 */
class BiscuitSecretsManager @Inject() (configuration: Configuration) extends SecretsManager {

  private val credentialsProvider: DefaultAWSCredentialsProviderChain = new DefaultAWSCredentialsProviderChain()

  private val regionHint: String = try {
    EC2MetadataUtils.getEC2InstanceRegion
  } catch {
    // Fallback for unit tests / local mode
    case _: com.amazonaws.AmazonClientException => "us-west-2"
  }

  private val kmsKeyManager: KeyManager = new KmsKeyManager(new Factory(regionHint, credentialsProvider), regionHint)

  private lazy val biscuit: Biscuit = {
    val _biscuit = new Biscuit.Builder()
      .withKeyManager(kmsKeyManager)
      .build()

    val yamlFileResource: String = configuration.getString("biscuit.yamlFile")

    Logger.info(s"Reading secrets from $yamlFileResource")

    _biscuit.read(
      new InputStreamReader(getClass.getClassLoader.getResource(yamlFileResource).openStream())
    )

    _biscuit
  }

  class Factory(region: String, credentialsProvider: AWSCredentialsProvider) extends KmsKeyManager.AWSKMSFactory {
    override def create(s: String): AWSKMS = {
      Logger.info(s"Using the access key for biscuit ${credentialsProvider.getCredentials.getAWSAccessKeyId}")
      Region.getRegion(Regions.fromName(region)).createClient(
        classOf[AWSKMSClient], credentialsProvider, null
      )
    }
  }

  override def getSecret(name: String): Array[Byte] = {
    biscuit.get(name)
  }

  override def getSecretUtf8(name: String): String = {
    Logger.info(s"Getting secret ($name)")
    new String(getSecret(name), StandardCharsets.UTF_8)
  }
}
