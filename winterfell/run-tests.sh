#!/bin/bash

# First run java tests / build.
pushd pdf-filler
./mvnw clean package
popd

# Then run java server
pm2 start process.json --only PdfMicroservice

# Then run node.js/express tests
NODE_ENV=test ./node_modules/mocha/bin/mocha

# Cleanup microservice
pm2 stop PdfMicroservice
