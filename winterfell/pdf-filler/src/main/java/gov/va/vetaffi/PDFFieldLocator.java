package gov.va.vetaffi;

import com.fasterxml.jackson.annotation.JsonProperty;

import javax.annotation.Nullable;
import java.util.Map;

/**
 * JSON Schema for locating the PDF field for a form field
 */
public class PDFFieldLocator {

    public PDFFieldLocator() {}

    /**
     * PDF field id
     */
    @JsonProperty
    public String pdfId;

    /**
     * Form element id
     */
    @JsonProperty
    public String elementId;

    /**
     * If multiple form fields map to this PDF field, in what order should they be concatenated?
     */
    @JsonProperty
    public Integer concatOrder = 0;

    /**
     * If the PDF field id depends on the value (i.e. checkbox components)
     */
    @JsonProperty
    public Map<String, String> idMap = null;

    /**
     * Define a substring of the value to be placed in the field
     */
    @JsonProperty
    public Integer substringStart;
    @JsonProperty
    public Integer substringEnd;

    /**
     * Is the value a base64 encoded image to be overlayed?
     */
    @JsonProperty
    public Boolean isBase64ImageBlob = false;

    public PDFFieldLocator(String pdfId,
                           String elementId,
                           Integer concatOrder,
                           @Nullable Map<String, String> idMap,
                           @Nullable Integer substringStart,
                           @Nullable Integer substringEnd,
                           Boolean isBase64ImageBlob) {
        this.pdfId = pdfId;
        this.elementId = elementId;
        this.concatOrder = concatOrder;
        this.idMap = idMap;
        this.substringStart = substringStart;
        this.substringEnd = substringEnd;
        this.isBase64ImageBlob = isBase64ImageBlob;
    }

    public boolean hasIdMap() {
        return !(idMap == null);
    }


    @Override
    public String toString() {
        return "PDFFieldLocator{" +
                "pdfId='" + pdfId + '\'' +
                ", elementId='" + elementId + '\'' +
                ", concatOrder=" + concatOrder +
                ", idMap=" + idMap +
                ", substringStart=" + substringStart +
                ", substringEnd=" + substringEnd +
                ", isBase64ImageBlob=" + isBase64ImageBlob +
                '}';
    }
}
