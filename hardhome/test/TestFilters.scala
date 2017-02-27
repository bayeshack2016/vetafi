import javax.inject.Inject

import com.digitaltangible.playguard.GuardFilter
import play.api.http.DefaultHttpFilters
import play.filters.csrf.CSRFFilter
import play.filters.headers.SecurityHeadersFilter

/**
 * Only these filters will be enabled during test
 */
class TestFilters @Inject() (
  csrfFilter: CSRFFilter,
  securityHeadersFilter: SecurityHeadersFilter,
  guardFilter: GuardFilter
) extends DefaultHttpFilters(
  csrfFilter,
  securityHeadersFilter,
  guardFilter
)
