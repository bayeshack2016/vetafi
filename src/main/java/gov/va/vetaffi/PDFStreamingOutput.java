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
        InputStream inputStream = PDFStreamingOutput.class.getClassLoader().getResourceAsStream(template);
        PdfReader reader = new PdfReader(inputStream);
        PdfStamper stamper;
        List<PDFFieldLocator> pdfFieldLocators = PDFMapping.getSpec(PDFStreamingOutput.class.getClassLoader().getResourceAsStream(locators));
        try {
            stamper = new PdfStamper(reader, outputStream);
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        AcroFields form = stamper.getAcroFields();
        try {
            Map<String, String> stringStringMap = PDFMapping.mapStringValues(fields, pdfFieldLocators);
            for (Map.Entry<String, String> entry : stringStringMap.entrySet()) {
                logger.info("Setting " + entry.getKey() + " to " + entry.getValue());
                form.setField(entry.getKey(), entry.getValue());
            }
            Map<String, Boolean> stringBoolMap = PDFMapping.mapCheckboxValues(fields, pdfFieldLocators);
            for (Map.Entry<String, Boolean> entry : stringBoolMap.entrySet()) {
                logger.info("Setting " + entry.getKey() + " to " + entry.getValue());
                if (entry.getValue()) {
                    form.setField(entry.getKey(), "X");
                }
            }
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        stamper.setFormFlattening(false);
        try {
            stamper.close();
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        reader.close();
    }
}
