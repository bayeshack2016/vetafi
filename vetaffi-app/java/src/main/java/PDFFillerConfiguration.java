
import com.fasterxml.jackson.annotation.JsonProperty;
import io.dropwizard.Configuration;
import org.hibernate.validator.constraints.NotEmpty;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

public class PDFFillerConfiguration extends Configuration {
    @NotEmpty
    private String formDir;

    public String getFormDir() {
        return formDir;
    }

    @JsonProperty
    public void setFormDir(String dir) {
        this.formDir = dir;
    }
}
