package utils.secrets

trait SecretsManager {

  def getSecret(name: String): Array[Byte]

  def getSecretUtf8(name: String): String
}
