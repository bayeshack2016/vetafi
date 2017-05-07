package utils.secrets

import javax.inject.{ Inject, Singleton }

@Singleton()
class StaticSecrets @Inject() (secretsManager: SecretsManager) {
  lazy val mongoPassword: String = secretsManager.getSecretUtf8("prod::mongodb-password")
  lazy val mongoUsername: String = secretsManager.getSecretUtf8("prod::mongodb-user")
  lazy val mongoHosts: String = secretsManager.getSecretUtf8("prod::mongodb-hosts")
}
