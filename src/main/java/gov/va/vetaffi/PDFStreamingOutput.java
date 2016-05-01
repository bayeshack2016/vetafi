package gov.va.vetaffi;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.base.Predicate;
import com.google.common.base.Throwables;
import com.google.common.collect.*;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;
import org.apache.log4j.Logger;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

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
        List<PDFFieldLocator> pdfFieldLocators =
                PDFMapping.getSpec(PDFStreamingOutput.class.getClassLoader().getResourceAsStream(locators));
        PDFStamping.stampPdf(pdfTemplate, fields, pdfFieldLocators, outputStream);
    }
}
