import javax.inject.Inject

import com.digitaltangible.playguard.GuardFilter
import filters.{ AccessLogFilter, HttpsRedirectFilter }
import play.api.http.DefaultHttpFilters
import play.filters.csrf.CSRFFilter
import play.filters.headers.SecurityHeadersFilter
import play.filters.hosts.AllowedHostsFilter

class Filters @Inject() (
  csrfFilter: CSRFFilter,
  allowedHostsFilter: AllowedHostsFilter,
  securityHeadersFilter: SecurityHeadersFilter,
  guardFilter: GuardFilter,
  httpsRedirectFilter: HttpsRedirectFilter,
  accessLogFilter: AccessLogFilter
) extends DefaultHttpFilters(
  csrfFilter,
  allowedHostsFilter,
  securityHeadersFilter,
  guardFilter,
  httpsRedirectFilter,
  accessLogFilter
)
