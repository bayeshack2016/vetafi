package gov.va.vetaffi;

import com.codahale.metrics.annotation.Timed;
import io.dropwizard.jersey.params.NonEmptyStringParam;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.util.List;

@Path("/create/{form}")
@Produces("application/pdf")
public class PDFFillerResource {
    private static final Logger logger = Logger.getLogger(PDFStreamingOutput.class);

    private final String formDir;

    public PDFFillerResource(String formDir) {
        this.formDir = formDir;
    }

    @POST
    @Timed
    @Consumes("application/json")
    public Response createPDF(@PathParam("form") NonEmptyStringParam form, List<PDFField> fields) {
        String template = FilenameUtils.concat(formDir, form.get().get() + ".pdf");
        String locators = FilenameUtils.concat(formDir, form.get().get() + ".locators.json");

        if (PDFFillerResource.class.getClassLoader().getResource(template) == null) {
            logger.warn("No such template " + template);
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (PDFFillerResource.class.getClassLoader().getResource(locators) == null) {
            logger.warn("No such locators.json file " + locators);
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        logger.info("Processing request for template " + template + " with data " + fields);
        return Response.ok(new PDFStreamingOutput(fields, template, locators)).build();
    }
}
