package gov.va.vetaffi;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class PDFFieldLocatorSpec {

    @JsonProperty
    public Map<String, PDFFieldLocator> locatorMap;
}
