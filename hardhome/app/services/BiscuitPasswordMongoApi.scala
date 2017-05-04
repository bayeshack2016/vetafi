package services

import javax.inject.Inject

import play.api.inject.ApplicationLifecycle
import play.api._
import play.modules.reactivemongo.{DefaultReactiveMongoApi, ReactiveMongoApi}
import reactivemongo.api.MongoConnection.ParsedURI
import reactivemongo.api.gridfs.GridFS
import reactivemongo.api.{DefaultDB, MongoConnection, MongoDriver}
import reactivemongo.play.json.JSONSerializationPack
import utils.secrets.SecretsManager

import scala.concurrent.{Await, Future}
import scala.util.Failure

/**
  * Custom MongoApi
  */
class BiscuitPasswordMongoApi @Inject() (secretsManager: SecretsManager,
                                         configuration: Configuration,
                                         environment: Environment,
                                         applicationLifecycle: ApplicationLifecycle) extends ReactiveMongoApi {

  lazy val driver: MongoDriver = new MongoDriver(Some(configuration.underlying))

  def getProdUri: ParsedURI = {
    val password: String = secretsManager.getSecretUtf8("prod::mongodb-password")
    val username: String = secretsManager.getSecretUtf8("prod::mongodb-user")
    val hosts: String = secretsManager.getSecretUtf8("prod::mongodb-hosts")
    val db: String = configuration.getString("mongodb.db").getOrElse("test")

    val uri: String = s"mongodb://$username:$password@$hosts/$db?ssl=true"
    MongoConnection.parseURI(uri).get
  }

  def getNotProdUri: ParsedURI = {
   MongoConnection.parseURI(configuration.getString("mongodb.uri").get).get
  }

  override def connection: MongoConnection = {
    val connectionOption = environment.mode match {
      case Mode.Prod => driver.connection(getProdUri, strictUri = false)
      case _ => driver.connection(getNotProdUri, strictUri = false)
    }
    registerDriverShutdownHook(connectionOption.get, driver)
    connectionOption.get
  }

  override def database: Future[DefaultDB] = {
    val db = environment.mode match {
      case Mode.Prod => getProdUri.db.get
      case _ => getNotProdUri.db.get
    }

    connection.database(db)
  }

  override def asyncGridFS: Future[GridFS[JSONSerializationPack.type]] = {
    import scala.concurrent.ExecutionContext.Implicits.global

    database.map(GridFS[JSONSerializationPack.type](_))
  }

  override def db: DefaultDB = {
    val db = environment.mode match {
      case Mode.Prod => getProdUri.db.get
      case _ => getNotProdUri.db.get
    }

    connection(db)
  }

  override def gridFS: GridFS[JSONSerializationPack.type] = {
    GridFS[JSONSerializationPack.type](db)
  }

  private def registerDriverShutdownHook(connection: MongoConnection, mongoDriver: MongoDriver): Unit = {
    import scala.concurrent.ExecutionContext.Implicits.global
    import scala.concurrent.duration._

    applicationLifecycle.addStopHook { () =>
      Logger.info("ReactiveMongoApi stopping...")

      Await.ready(connection.askClose()(10.seconds).map { _ =>
        Logger.info("ReactiveMongoApi connections are stopped")
      }.andThen {
        case Failure(reason) =>
          reason.printStackTrace()
          mongoDriver.close() // Close anyway

        case _ => mongoDriver.close()
      }, 12.seconds)
    }
  }
}
