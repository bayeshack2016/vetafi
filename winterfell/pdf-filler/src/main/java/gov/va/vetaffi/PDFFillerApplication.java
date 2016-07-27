package gov.va.vetaffi;

import io.dropwizard.Application;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;

public class PDFFillerApplication extends Application<PDFFillerConfiguration> {
    public static void main(String[] args) throws Exception {
        new PDFFillerApplication().run(args);
    }

    @Override
    public void run(PDFFillerConfiguration pdfFillerConfiguration, Environment environment) throws Exception {
        final PDFFillerResource resource = new PDFFillerResource(
                pdfFillerConfiguration.getFormDir()
        );
        environment.jersey().register(resource);
        final PDFHealthCheck healthCheck =
                new PDFHealthCheck(pdfFillerConfiguration.getFormDir());
        environment.healthChecks().register("pdfForms", healthCheck);
        environment.jersey().setUrlPattern("/api/*");
        environment.jersey().register(resource);
    }

    @Override
    public void initialize(Bootstrap<PDFFillerConfiguration> myConfigurationBootstrap) {
    }
}
