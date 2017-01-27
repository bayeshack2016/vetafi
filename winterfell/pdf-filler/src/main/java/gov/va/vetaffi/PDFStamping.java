package gov.va.vetaffi;

import com.google.common.base.Throwables;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;

public class PDFStamping {
    private static final Logger logger = Logger.getLogger(PDFStamping.class);

    private static byte[] CHECK = null;
    private static final String ACRO_FORM_CHECKED = "1";
    static {
        try {
            CHECK = IOUtils.toByteArray(PDFStamping.class.getClassLoader().getResourceAsStream("check.png"));
        } catch (IOException e) {
            Throwables.propagate(e);
        }
    }

    private static Rectangle getRectangleForField(AcroFields fields, String key) {
        double[] rectVals = fields.getFieldItem(key).getValue(0).getAsArray(PdfName.RECT).asDoubleArray();
        return new Rectangle((float) rectVals[0],
                (float) rectVals[1],
                (float) rectVals[2],
                (float) rectVals[3]);
    }

    private static Rectangle get2xRectangleForField(AcroFields fields, String key) {
        double[] rectVals = fields.getFieldItem(key).getValue(0).getAsArray(PdfName.RECT).asDoubleArray();
        return new Rectangle((float) rectVals[0],
                (float) (rectVals[1] - ((rectVals[3] - rectVals[1]) / 2)),
                (float) rectVals[2],
                (float) (rectVals[3] + ((rectVals[3] - rectVals[1]) / 2)));
    }

    private static void placeImageInRectangle(Image image, Rectangle rectangle) {
        float x = rectangle.getLeft();
        float y = rectangle.getBottom();
        image.setAbsolutePosition(x, y);
        image.scaleToFit(rectangle);
    }

    private static Integer getPageForField(AcroFields form, String key) {
        return form.getFieldItem(key).getPage(0);
    }

    private static void stampCheckbox(
            String key,
            Boolean value,
            AcroFields form,
            PdfStamper stamper,
            PdfReader reader) throws DocumentException, IOException {
        if (value) {
            form.setField(key, ACRO_FORM_CHECKED);

            // Overlay with custom check image in addition to setting to "On"
            Image img = Image.getInstance(CHECK);
            Rectangle linkLocation = getRectangleForField(form, key);
            placeImageInRectangle(img, linkLocation);
            Integer pageIdx = getPageForField(form, key);
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

    private static final int MAX_FONT_SIZE = 32;

    private static void stampText(String key, String value, AcroFields form, PdfStamper pdfStamper) {
        Rectangle rectangle = getRectangleForField(form, key);
        Integer pageIdx = getPageForField(form, key);
        PdfContentByte pdfContentByte = pdfStamper.getOverContent(pageIdx);
        float fontSize = ColumnText.fitText(
                new Font(Font.FontFamily.COURIER),
                value,
                rectangle,
                MAX_FONT_SIZE,
                PdfWriter.RUN_DIRECTION_DEFAULT);

        // A litte bit smaller than the exact height of the box is easier to read
        Font font = new Font(Font.FontFamily.COURIER, fontSize * 0.90f);
        logger.info("Stamping " + value + " to rectangle " + rectangle + " with size " + fontSize);
        Chunk text = new Chunk(value, font);
        text.setBackground(BaseColor.WHITE);
        Paragraph paragraph = new Paragraph(text);
        // How text is positioned is unclear, but 25% from bottom of box seems ideal
        ColumnText.showTextAligned(pdfContentByte, Element.ALIGN_LEFT,
                paragraph, rectangle.getLeft(),
                (rectangle.getBottom() + ((rectangle.getTop() - rectangle.getBottom())/4)),
                0);
        pdfContentByte.saveState();
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
                logger.info("Stamping text: " + entry.getKey() + " with " + entry.getValue());
                stampText(entry.getKey(), entry.getValue(), form, stamper);
            }
            Map<String, Boolean> stringBoolMap = PDFMapping.mapCheckboxValues(fields, pdfFieldLocators);
            for (Map.Entry<String, Boolean> entry : stringBoolMap.entrySet()) {
                logger.info("Stamping checkbox: " + entry.getKey() + " with " + entry.getValue());
                stampCheckbox(entry.getKey(), entry.getValue(), form, stamper, reader);
            }
            Map<String, String> imageMap = PDFMapping.mapBase64ImageBlogValues(fields, pdfFieldLocators);
            for (Map.Entry<String, String> entry : imageMap.entrySet()) {
                stampSignature(stamper, form, entry.getKey(), entry.getValue());
            }
            for (int i = 0; i < reader.getNumberOfPages(); i++) {
                form.removeFieldsFromPage(i+1); // Pages are always 1 indexed
            }
            form.removeXfa();
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

    public static void stampSignature(PdfStamper stamper,
                                      AcroFields acroFields,
                                      String key,
                                      String base64Image) throws DocumentException, IOException {
        Image image = Image.getInstance(Base64.getDecoder().decode(base64Image.split(",")[1]));
        Rectangle rectangle = get2xRectangleForField(acroFields, key);
        placeImageInRectangle(image, rectangle);
        stamper.getOverContent(getPageForField(acroFields, key)).addImage(image);
    }
}
