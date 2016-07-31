#!/bin/bash
pushd pdf-filler

# First run java tests / build.
# ./mvnw clean package

java -Ddw.server.applicationConnectors\[0\].port=9797 -jar target/pdf-filler-1.0-SNAPSHOT.jar server config.yaml >>pdf-filler.log 2>&1  &
pid=$!

popd

# Then run node.js/express tests
NODE_ENV=test ./node_modules/mocha/bin/mocha

# Cleanup microservice
kill ${pid}
rm pdf-filler/pdf-filler.log
