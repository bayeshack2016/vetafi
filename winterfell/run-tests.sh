#!/bin/bash

# First run java tests / build.
pushd pdf-filler
./mvnw clean package
popd

# Then run servers
pm2 start process.json

# Then run node.js/express tests
pm2 stop Express
NODE_ENV=test ./node_modules/mocha/bin/mocha --timeout 10000

# Cleanup microservice
pm2 stop PdfMicroservice
