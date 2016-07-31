package gov.va.vetaffi;

import com.google.common.base.Throwables;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.PdfCopy;
import com.itextpdf.text.pdf.PdfReader;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 * Concatenation of multiple pdf documents
 */
public class PDFConcatenation implements StreamingOutput {

    private final List<InputStream> pdfs;

    public PDFConcatenation(List<InputStream> pdfs) {
        this.pdfs = pdfs;
    }

    /**
     * Concatenate pdfs and write to output stream.
     * <p/>
     * Will insert a page break if needed between documents for double sided printing.
     */
    public void concatForDoubleSidedPrinting(
            List<InputStream> pdfs,
            OutputStream outputStream) throws DocumentException, IOException {
        Document document = new Document();
        PdfCopy pdfCopy = new PdfCopy(document, outputStream);

        document.open();

        try {
            for (InputStream inputStream : pdfs) {
                PdfReader reader;
                reader = new PdfReader(inputStream);

                int numberOfPages = reader.getNumberOfPages();

                for (int i = 0; i < numberOfPages; i++) {
                    pdfCopy.addPage(pdfCopy.getImportedPage(reader, i + 1));
                }

                if (numberOfPages % 2 != 0) { // Add page break between documents
                    pdfCopy.newPage();
                    pdfCopy.setPageEmpty(false);
                }
            }
        } finally {
            document.close();
        }
    }

    @Override
    public void write(OutputStream outputStream) throws IOException, WebApplicationException {
        try {
            concatForDoubleSidedPrinting(this.pdfs, outputStream);
        } catch (DocumentException e) {
            throw Throwables.propagate(e);
        }
    }
}
