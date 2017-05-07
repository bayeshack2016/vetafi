package services

import org.mockito.Mockito
import play.modules.reactivemongo.ReactiveMongoApi
import reactivemongo.api.gridfs.GridFS
import reactivemongo.api.{ DefaultDB, MongoConnection, MongoDriver }
import reactivemongo.play.json.JSONSerializationPack

import scala.concurrent.Future

class FakeReactiveMongoApi extends ReactiveMongoApi {
  override def driver: MongoDriver = {
    Mockito.mock(classOf[MongoDriver])
  }

  override def connection: MongoConnection = {
    Mockito.mock(classOf[MongoConnection])
  }

  override def database: Future[DefaultDB] = {
    Future.successful(db)
  }

  override def asyncGridFS: Future[GridFS[JSONSerializationPack.type]] = ???

  override def db: DefaultDB = {
    DefaultDB("fake", connection)
  }

  override def gridFS: GridFS[JSONSerializationPack.type] = ???
}
