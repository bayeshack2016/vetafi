package gov.va.vetaffi;

import com.codahale.metrics.annotation.Timed;
import com.google.common.collect.Lists;
import org.apache.log4j.Logger;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.InputStream;
import java.util.ArrayList;

/**
 * Resource for concatenating multiple pdf files.
 */
@Path("/concat")
@Produces("application/pdf")
public class PDFConcatResource {
    private static final Logger logger = Logger.getLogger(PDFConcatResource.class);

    @POST
    @Timed
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response createPDF(FormDataMultiPart multiPart) {
        ArrayList<InputStream> pdfs = Lists.newArrayList();
        logger.info("Received multipart:" + multiPart.getFields().toString());

        for (FormDataBodyPart part : multiPart.getFields("attachments")) {
            pdfs.add(part.getValueAs(InputStream.class));
        }

        logger.info("Received " + pdfs.size() + " pdfs to concat");
        return Response.ok(new PDFConcatenation(pdfs)).build();
    }
}
