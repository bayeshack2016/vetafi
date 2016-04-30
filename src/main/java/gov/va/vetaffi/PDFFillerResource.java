package gov.va.vetaffi;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dropwizard.jersey.params.NonEmptyStringParam;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
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

        logger.info("Processing request for template " + template + " with data " + fields);

        return Response.ok(new PDFStreamingOutput(fields, template)).build();
    }
}
