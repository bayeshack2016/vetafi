package gov.va.vetaffi;

import org.apache.log4j.Logger;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

public class PDFStreamingOutput implements StreamingOutput {

    private static final Logger logger = Logger.getLogger(PDFStreamingOutput.class);

    private final List<PDFField> fields;
    private final String template;
    private final String locators;

    public PDFStreamingOutput(List<PDFField> fields, String template, String locators) {
        this.fields = fields;
        this.template = template;
        this.locators = locators;
    }

    @Override
    public void write(OutputStream outputStream) throws IOException, WebApplicationException {
        InputStream pdfTemplate =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream(template);
        List<PDFFieldLocator> pdfFieldLocators;
        try {
            pdfFieldLocators =
                    PDFMapping.getSpec(PDFStreamingOutput.class.getClassLoader().getResourceAsStream(locators));
        } catch (Exception e) {
            logger.error(e);
            throw e;
        }
        PDFStamping.stampPdf(pdfTemplate, fields, pdfFieldLocators, outputStream);
    }
}
