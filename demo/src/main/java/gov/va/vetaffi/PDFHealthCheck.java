package gov.va.vetaffi;

import com.codahale.metrics.health.HealthCheck;

import java.net.URL;

/**
 * Health check for PDF files
 */
public class PDFHealthCheck extends HealthCheck {

    private final String formDir;

    public PDFHealthCheck(String formDir) {
        this.formDir = formDir;
    }

    @Override
    protected Result check() throws Exception {
        URL formsDir = PDFHealthCheck.class.getClassLoader().getResource(formDir);
        if (formsDir != null) {
            return Result.healthy();
        } else {
            return Result.unhealthy("Could not load forms.");
        }
    }
}
