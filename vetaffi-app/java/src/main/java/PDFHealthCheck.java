import com.codahale.metrics.health.HealthCheck;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Created by jeffreyquinn on 4/24/16.
 */
public class PDFHealthCheck extends HealthCheck {

    private final String formDir;

    public PDFHealthCheck(String formDir) {
        this.formDir = formDir;
    }

    @Override
    protected Result check() throws Exception {
        Path path = Paths.get(formDir);
        if (Files.exists(path) && Files.isDirectory(path)) {
            return Result.healthy();
        } else {
            return Result.unhealthy("Bad form dir");
        }
    }
}
