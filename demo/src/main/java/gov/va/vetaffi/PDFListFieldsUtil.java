package gov.va.vetaffi;

import com.google.common.base.Throwables;
import com.google.common.collect.ComparisonChain;
import com.google.common.collect.Lists;
import com.google.common.collect.Ordering;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.PdfName;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;
import org.apache.commons.io.output.NullOutputStream;
import org.json.simple.JSONObject;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Util for listing fields in a given PDF
 *
 * Will display fields in the order they appear physically in the document
 */
public class PDFListFieldsUtil {

    public static final Ordering<Map.Entry<String, AcroFields.Item>> FIELD_PAGE_APPEARANCE_ORDERING = new Ordering<Map.Entry<String, AcroFields.Item>>() {
        @Override
        public int compare(Map.Entry<String, AcroFields.Item> left, Map.Entry<String, AcroFields.Item> right) {

            return ComparisonChain.start()
                    .compare(left.getValue().getPage(0).intValue(), right.getValue().getPage(0).intValue())
                    .compare(left.getValue().getValue(0).getAsArray(PdfName.RECT).asDoubleArray()[1],
                            right.getValue().getValue(0).getAsArray(PdfName.RECT).asDoubleArray()[1],
                            Ordering.natural().reverse())
                    .compare(left.getValue().getValue(0).getAsArray(PdfName.RECT).asDoubleArray()[0],
                            right.getValue().getValue(0).getAsArray(PdfName.RECT).asDoubleArray()[0],
                            Ordering.natural())
                    .result();

        }
    };

    public static void main(String args[]) throws Exception {
        InputStream pdfTemplate =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream(args[0]);
        PdfReader reader = new PdfReader(pdfTemplate);
        PdfStamper stamper;
        try {
            stamper = new PdfStamper(reader, new NullOutputStream());
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        AcroFields form = stamper.getAcroFields();
        Map<String, AcroFields.Item> fields = form.getFields();
        ArrayList<Map.Entry<String, AcroFields.Item>> entries = Lists.newArrayList(fields.entrySet().iterator());
        List<Map.Entry<String, AcroFields.Item>> items = FIELD_PAGE_APPEARANCE_ORDERING.sortedCopy(entries);

        for (Map.Entry<String, AcroFields.Item> item : items) {
            System.out.print(
                    item.getValue().getValue(0).getAsString(PdfName.T).getEncoding() + " ");
            System.out.println(
                    item.getKey());
        }
    }
}
