package gov.va.vetaffi;

import com.google.common.collect.Lists;
import com.itextpdf.text.pdf.PdfReader;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

import static org.junit.Assert.assertEquals;

public class PDFConcatenationTest {

    @Test
    public void testConcatForDoubleSidedPrintingHasCorrectNumberOfPages() throws Exception {
        InputStream pdf1 =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-4502-ARE.pdf");
        InputStream pdf2 =
                PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-0781-ARE.pdf");

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

        new PDFConcatenation(Lists.newArrayList(pdf1, pdf2)).write(byteArrayOutputStream);

        PdfReader concatReader = new PdfReader(new ByteArrayInputStream(byteArrayOutputStream.toByteArray()));

        PdfReader pdf1Reader =
                new PdfReader(PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-4502-ARE.pdf"));
        PdfReader pdf2Reader =
                new PdfReader(PDFStreamingOutput.class.getClassLoader().getResourceAsStream("forms/VBA-21-0781-ARE.pdf"));

        assertEquals((pdf1Reader.getNumberOfPages() + (pdf1Reader.getNumberOfPages() % 2)) +
                        (pdf2Reader.getNumberOfPages() + (pdf2Reader.getNumberOfPages() % 2)),
                concatReader.getNumberOfPages());
    }
}