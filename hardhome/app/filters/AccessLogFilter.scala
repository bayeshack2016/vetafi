package filters

import javax.inject.Inject
import akka.stream.Materializer
import play.api.mvc.{ Result, RequestHeader, Filter }
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import org.log4s._

class AccessLogFilter @Inject() (implicit val mat: Materializer) extends Filter {

  private[this] val logger = getLogger

  def apply(nextFilter: RequestHeader => Future[Result])(requestHeader: RequestHeader): Future[Result] = {
    logger.debug(requestHeader.toString())
    nextFilter(requestHeader)
  }
}
