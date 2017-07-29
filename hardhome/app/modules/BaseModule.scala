package modules

import com.google.inject.AbstractModule
import models.daos._
import net.codingwell.scalaguice.ScalaModule
import play.modules.reactivemongo.ReactiveMongoApi
import services.documents.{ DocumentService, SeamlessDocsDocumentService }
import services._
import services.forms._
import services.submission.{ FaxSubmissionService, SubmissionService }
import utils.seamlessdocs.{ SeamlessDocsService, SeamlessDocsServiceImpl }
import utils.secrets.{ BiscuitSecretsManager, SecretsManager, StaticSecrets }

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
    bind[MailingListDAO].to[MailingListDAOImpl]
    bind[SecretsManager].to[BiscuitSecretsManager]
    bind[FormConfigManager].to[JsonResourceFormConfigManager]
    bind[ContactInfoService].to[ContactInfoServiceImpl]
    bind[ClaimService].to[ClaimServiceImpl]
    bind[SubmissionService].to[FaxSubmissionService]
    bind[DocumentService].to[SeamlessDocsDocumentService]
    bind[SeamlessDocsService].to[SeamlessDocsServiceImpl]
    bind[ReactiveMongoApi].to[BiscuitPasswordMongoApi]
    bind[UserValuesService].to[UserValuesServiceImpl]
  }
}
