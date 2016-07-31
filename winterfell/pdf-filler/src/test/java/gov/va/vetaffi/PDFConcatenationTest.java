package gov.va.vetaffi;

import com.google.common.collect.Lists;
import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import static org.junit.Assert.assertTrue;

public class PDFConcatenationTest {

    @Test
    public void testConcatForDoubleSidedPrintingSucceeds() throws Exception {
        InputStream pdf1 =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-4502-ARE.pdf");
        InputStream pdf2 =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-0781-ARE.pdf");

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

        new PDFConcatenation(Lists.newArrayList(pdf1, pdf2)).write(byteArrayOutputStream);

        assertTrue(byteArrayOutputStream.size() > 0);
    }
}