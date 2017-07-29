package services

import javax.inject.{ Inject, Singleton }

import play.api.inject.ApplicationLifecycle
import play.api._
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.MongoConnection.ParsedURI
import reactivemongo.api.gridfs.GridFS
import reactivemongo.api.{ DefaultDB, MongoConnection, MongoConnectionOptions, MongoDriver }
import reactivemongo.core.nodeset.{ Authenticate, Authentication }
import reactivemongo.play.json.JSONSerializationPack
import utils.secrets.{ SecretsManager, StaticSecrets }
import org.log4s._

import scala.concurrent.{ Await, Future }
import scala.util.Failure
import scala.concurrent.ExecutionContext.Implicits.global

/**
 * Custom MongoApi
 */
@Singleton
class BiscuitPasswordMongoApi @Inject() (
  secretsManager: SecretsManager,
  configuration: Configuration,
  environment: Environment,
  applicationLifecycle: ApplicationLifecycle,
  staticSecrets: StaticSecrets
) extends ReactiveMongoApi {

  private[this] val logger = getLogger

  lazy val driver: MongoDriver = new MongoDriver(
    Some(configuration.underlying),
    Some(this.getClass.getClassLoader)
  )

  lazy val getNotProdUri: ParsedURI = {
    MongoConnection.parseURI(configuration.getString("mongodb.uri").get).get
  }

  def getProdConnection(driver: MongoDriver): MongoConnection = {
    val options: MongoConnectionOptions = MongoConnectionOptions(
      sslEnabled = true,
      sslAllowsInvalidCert = true
    )

    logger.info(s"Authenticating with ${staticSecrets.mongoUsername} to ${staticSecrets.mongoHosts}")

    val con = driver.connection(
      staticSecrets.mongoHosts.split(","),
      options,
      name = Some("vetafi-prod-mongo-connection")
    )
    con.authenticate("admin", staticSecrets.mongoUsername, staticSecrets.mongoPassword)
    con
  }

  lazy val connection: MongoConnection = {
    val connection: MongoConnection = environment.mode match {
      case Mode.Prod => getProdConnection(driver)
      case _ => driver.connection(getNotProdUri, strictUri = false).get
    }
    registerDriverShutdownHook(connection, driver)
    connection
  }

  override def database: Future[DefaultDB] = {
    val db = environment.mode match {
      case Mode.Prod => configuration.getString("mongodb.db").getOrElse("test")
      case _ => getNotProdUri.db.get
    }

    connection.database(db)
  }

  override def asyncGridFS = ???

  override def db: DefaultDB = {
    val db = environment.mode match {
      case Mode.Prod => configuration.getString("mongodb.db").getOrElse("test")
      case _ => getNotProdUri.db.get
    }

    connection(db)
  }

  override def gridFS = ???

  private def registerDriverShutdownHook(connection: MongoConnection, mongoDriver: MongoDriver): Unit = {
    import scala.concurrent.duration._

    applicationLifecycle.addStopHook { () =>
      logger.info("ReactiveMongoApi stopping...")

      Await.ready(connection.askClose()(10.seconds).map { _ =>
        logger.info("ReactiveMongoApi connections are stopped")
      }.andThen {
        case Failure(reason) =>
          reason.printStackTrace()
          mongoDriver.close() // Close anyway

        case _ => mongoDriver.close()
      }, 12.seconds)
    }
  }
}
