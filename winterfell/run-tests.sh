#!/bin/bash
pushd pdf-filler

# First run java tests / build.
./mvnw clean package

java -Ddw.server.applicationConnectors\[0\].port=9797 -jar target/pdf-filler-1.0-SNAPSHOT.jar server config.yaml &
pid=$!

popd

# Then run node.js/express tests
./node_modules/mocha/bin/mocha

# Cleanup microservice
kill ${pid}