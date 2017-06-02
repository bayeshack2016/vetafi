#!/bin/bash
set -eux -o pipefail

APPLICATION_SECRET="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::play-app-secret)"
AUTHENTICATOR_CRYPTER_KEY="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::authenticator-crypter-key)"
AUTHENTICATOR_COOKIE_SIGNER_KEY="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::authenticator-cookie-signer-key)"

VETAFI_CLIENT_ID="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::id-me-client-id)"
VETAFI_CLIENT_SECRET="$(biscuit get --filename=conf/biscuit/secrets.yaml prod::id-me-client-secret)"

BOXFUSE_USER="$(biscuit get --filename=../config/biscuit/secrets.yaml boxfuse-user)"
BOXFUSE_SECRET="$(biscuit get --filename=../config/biscuit/secrets.yaml boxfuse-secret)"

sbt clean dist

boxfuse run -env=prod \
        -healthcheck=false \
        -envvars.APPLICATION_SECRET="${APPLICATION_SECRET}" \
        -envvars.AUTHENTICATOR_CRYPTER_KEY="${AUTHENTICATOR_CRYPTER_KEY}" \
        -envvars.AUTHENTICATOR_COOKIE_SIGNER_KEY="${AUTHENTICATOR_COOKIE_SIGNER_KEY}" \
        -envvars.VETAFI_CLIENT_ID="${VETAFI_CLIENT_ID}" \
        -envvars.VETAFI_CLIENT_SECRET="${VETAFI_CLIENT_SECRET}" \
        -jvm.args='-Dconfig.resource=application.prod.conf -Dlogger.resource=logback.prod.xml'
