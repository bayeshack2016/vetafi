# pdf-filler

Microservice for rendering pdf documents.

## Building
mvn clean package

## Running
java $JAVA_OPTS -Ddw.server.applicationConnectors\[0\].port=${PORT} -jar target/pdf-filler-1.0-SNAPSHOT.jar server config.yaml
