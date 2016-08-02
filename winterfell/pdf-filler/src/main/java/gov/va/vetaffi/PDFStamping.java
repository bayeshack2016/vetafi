package gov.va.vetaffi;

import com.google.common.base.Throwables;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Image;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.*;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

public class PDFStamping {
    private static final Logger logger = Logger.getLogger(PDFStamping.class);

    private static byte[] CHECK = null;
    static {
        try {
            CHECK = IOUtils.toByteArray(PDFStamping.class.getClassLoader().getResourceAsStream("check.png"));
        } catch (IOException e) {
            Throwables.propagate(e);
        }
    }
    public static void stampPdf(InputStream pdfTemplate,
                                List<PDFField> fields,
                                List<PDFFieldLocator> pdfFieldLocators,
                                OutputStream outputStream) throws IOException {
        PdfReader reader = new PdfReader(pdfTemplate);
        PdfStamper stamper;
        try {
            stamper = new PdfStamper(reader, outputStream);
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        AcroFields form = stamper.getAcroFields();
        try {
            Map<String, String> stringStringMap = PDFMapping.mapStringValues(fields, pdfFieldLocators);
            for (Map.Entry<String, String> entry : stringStringMap.entrySet()) {
                form.setField(entry.getKey(), entry.getValue());
            }
            Map<String, Boolean> stringBoolMap = PDFMapping.mapCheckboxValues(fields, pdfFieldLocators);
            for (Map.Entry<String, Boolean> entry : stringBoolMap.entrySet()) {
                if (entry.getValue()) {
                    form.setField(entry.getKey(), "1");

                    // Overlay with custom check image in addition to setting to "On"
                    Image img = Image.getInstance(CHECK);
                    double[] rectVals = form.getFieldItem(entry.getKey()).getValue(0).getAsArray(PdfName.RECT).asDoubleArray();
                    Rectangle linkLocation = new Rectangle((float) rectVals[0],
                            (float) rectVals[1],
                            (float) rectVals[2],
                            (float) rectVals[3]);
                    float x = (float) rectVals[0];
                    float y = (float) rectVals[1];
                    img.setAbsolutePosition(x, y);
                    img.scaleAbsolute(linkLocation);
                    Integer pageIdx = form.getFieldItem(entry.getKey()).getPage(0).intValue();
                    stamper.getOverContent(pageIdx).addImage(img);
                    PdfDestination destination = new PdfDestination(PdfDestination.FIT);
                    PdfAnnotation link = PdfAnnotation.createLink(stamper.getWriter(),
                            linkLocation,
                            PdfAnnotation.HIGHLIGHT_INVERT,
                            reader.getNumberOfPages(),
                            destination);
                    link.setBorder(new PdfBorderArray(0, 0, 0));
                    stamper.addAnnotation(link, pageIdx);
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
