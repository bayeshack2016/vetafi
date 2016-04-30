package gov.va.vetaffi;

import com.google.common.base.Throwables;
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

public class PDFStreamingOutput implements StreamingOutput {

    private static final Logger logger = Logger.getLogger(PDFStreamingOutput.class);

    private final List<PDFField> fields;
    private final String template;

    public PDFStreamingOutput(List<PDFField> fields, String template) {
        this.fields = fields;
        this.template = template;
    }

    @Override
    public void write(OutputStream outputStream) throws IOException, WebApplicationException {
        InputStream inputStream = PDFStreamingOutput.class.getClassLoader().getResourceAsStream(template);
        PdfReader reader = new PdfReader(inputStream);
        PdfStamper stamper;
        try {
            stamper = new PdfStamper(reader, outputStream);
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        AcroFields form = stamper.getAcroFields();
        try {
            for (PDFField field : fields) {
                logger.info("Setting " + field.getFieldName() + " to " + field.getFieldValue());
                form.setField(field.getFieldName(), field.getFieldValue());
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
