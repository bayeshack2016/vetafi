#!/bin/bash
set -eux -o pipefail

export VETAFI_CLIENT_ID="$(biscuit get --filename=conf/biscuit/secrets.yaml local::id-me-client-id)"
export VETAFI_CLIENT_SECRET="$(biscuit get --filename=conf/biscuit/secrets.yaml local::id-me-client-secret)"

sbt playRun -Dconfig.resource=application.local.conf -Dlogger.resource=logback.xml
