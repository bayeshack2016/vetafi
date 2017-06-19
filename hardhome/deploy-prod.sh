#!/bin/bash
set -eux -o pipefail

APPLICATION_SECRET="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::play-app-secret)"
AUTHENTICATOR_CRYPTER_KEY="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::authenticator-crypter-key)"
AUTHENTICATOR_COOKIE_SIGNER_KEY="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::authenticator-cookie-signer-key)"

VETAFI_CLIENT_ID="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::id-me-client-id)"
VETAFI_CLIENT_SECRET="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::id-me-client-secret)"

BOXFUSE_USER="$(biscuit get --filename=../config/biscuit/secrets.yaml boxfuse-user)"
BOXFUSE_SECRET="$(biscuit get --filename=../config/biscuit/secrets.yaml boxfuse-secret)"

NEWRELIC_LICENSE_KEY="$(biscuit get --filename=../config/biscuit/secrets.yaml newrelic-license-key)"

sbt clean dist

boxfuse run -env=prod \
        -healthcheck=false \
        -ports.http=80 \
        -ports.https=443 \
        -envvars.APPLICATION_SECRET="${APPLICATION_SECRET}" \
        -envvars.AUTHENTICATOR_CRYPTER_KEY="${AUTHENTICATOR_CRYPTER_KEY}" \
        -envvars.AUTHENTICATOR_COOKIE_SIGNER_KEY="${AUTHENTICATOR_COOKIE_SIGNER_KEY}" \
        -envvars.VETAFI_CLIENT_ID="${VETAFI_CLIENT_ID}" \
        -envvars.VETAFI_CLIENT_SECRET="${VETAFI_CLIENT_SECRET}" \
        -newrelic.licensekey="${NEWRELIC_LICENSE_KEY}" \
        -jvm.args='-Dhttp.port=80 -Dhttps.port=443 -Dconfig.resource=application.prod.conf -Dlogger.resource=logback.prod.xml'
