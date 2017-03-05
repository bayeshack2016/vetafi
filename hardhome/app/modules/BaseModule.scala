package modules

import com.google.inject.AbstractModule
import models.daos._
import models.services.{AuthTokenService, AuthTokenServiceImpl}
import net.codingwell.scalaguice.ScalaModule
import utils.forms.{ContactInfoService, ContactInfoServiceImpl, FormConfigManager, JsonResourceFormConfigManager}
import utils.secrets.{BiscuitSecretsManager, SecretsManager}

/**
 * The base Guice module, manages Dependency Injection for interfaces defined by our project.
 *
 * Do not add bindings for library interfaces, i.e. Silhouette
 */
class BaseModule extends AbstractModule with ScalaModule {

  /**
   * Configures the module.
   */
  def configure(): Unit = {
    bind[AuthTokenDAO].to[AuthTokenDAOImpl]
    bind[AuthTokenService].to[AuthTokenServiceImpl]
    bind[UserDAO].to[UserDAOImpl]
    bind[UserValuesDAO].to[UserValuesDAOImpl]
    bind[ClaimDAO].to[ClaimDAOImpl]
    bind[FormDAO].to[FormDAOImpl]
    bind[SecretsManager].to[BiscuitSecretsManager]
    bind[FormConfigManager].to[JsonResourceFormConfigManager]
    bind[ContactInfoService].to[ContactInfoServiceImpl]
  }
}
