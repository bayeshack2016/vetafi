import javax.inject.Inject

import com.digitaltangible.playguard.GuardFilter
import filters.HttpsRedirectFilter
import play.api.http.DefaultHttpFilters
import play.filters.csrf.CSRFFilter
import play.filters.headers.SecurityHeadersFilter
import play.filters.hosts.AllowedHostsFilter

class Filters @Inject() (
  csrfFilter: CSRFFilter,
  allowedHostsFilter: AllowedHostsFilter,
  securityHeadersFilter: SecurityHeadersFilter,
  guardFilter: GuardFilter,
  httpsRedirectFilter: HttpsRedirectFilter
) extends DefaultHttpFilters(
  csrfFilter,
  allowedHostsFilter,
  securityHeadersFilter,
  guardFilter,
  httpsRedirectFilter
)
