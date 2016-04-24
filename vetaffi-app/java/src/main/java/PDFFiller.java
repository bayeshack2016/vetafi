import com.itextpdf.text.pdf.AcroFields;
import com.itextpdf.text.pdf.PdfReader;
import com.itextpdf.text.pdf.PdfStamper;

import java.io.FileOutputStream;

/**
 * Created by jeffreyquinn on 4/24/16.
 */
public class PDFFiller {

    public static void main(String[] args) throws Exception {
        PdfReader reader = new PdfReader("/Users/jeffreyquinn/Code/VA_hackathon/Vetaffi/forms/VBA-21-526EZ-ARE.pdf");
        PdfStamper stamper = new PdfStamper(reader, new FileOutputStream("/Users/jeffreyquinn/Code/VA_hackathon/Vetaffi/forms/test.pdf"));
        AcroFields form = stamper.getAcroFields();
        form.setField("namelast1[0]", "Adsgsdgdsfgdsfg");
        stamper.setFormFlattening(false);
        stamper.close();
        reader.close();

    }
}
