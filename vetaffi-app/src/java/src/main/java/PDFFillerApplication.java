import io.dropwizard.Application;
import io.dropwizard.setup.Environment;

/**
 * Created by jeffreyquinn on 4/24/16.
 */
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
        environment.jersey().register(resource);
    }
}
