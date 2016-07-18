package gov.va.vetaffi;

import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;
import org.apache.commons.io.output.NullOutputStream;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.*;

public class PDFStampingTest {

    @Rule
    public TemporaryFolder TMP = new TemporaryFolder();

    @Test
    public void testStampPdfWithCheckAndText() throws Exception {
        InputStream pdfTemplate =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-4502-ARE.pdf");
        File tmpFile = TMP.newFile();

        HashMap<String, String> idMap = Maps.newHashMap();
        idMap.put("Army", "ARMY[0]");
        PDFStamping.stampPdf(pdfTemplate,
                Lists.newArrayList(
                        new PDFField("first_name", "jeff"),
                        new PDFField("branch", "Army")
                ),
                Lists.newArrayList(
                        new PDFFieldLocator("namefirst1[0]", "first_name", 0, null, null, null),
                        new PDFFieldLocator(null, "branch", 0, idMap, null, null)
                ),
                new FileOutputStream(tmpFile));
    }

    @Test
    public void t() throws Exception {
        InputStream pdfTemplate =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-526EZ-ARE.pdf");
        PdfReader reader = new PdfReader(pdfTemplate);
        PdfStamper stamper;
        try {
            stamper = new PdfStamper(reader, new NullOutputStream());
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
        AcroFields form = stamper.getAcroFields();
        Map<String, AcroFields.Item> fields = form.getFields();
        System.out.println(fields);


    }
}