#!/bin/bash
set -eux -o pipefail

APPLICATION_SECRET=$1
AUTHENTICATOR_CRYPTER_KEY=$2
AUTHENTICATOR_COOKIE_SIGNER_KEY=$3

boxfuse run -env=prod \
        -healthcheck=false \
        -envvars.APPLICATION_SECRET=${APPLICATION_SECRET} \
        -envvars.AUTHENTICATOR_CRYPTER_KEY=${AUTHENTICATOR_CRYPTER_KEY} \
        -envvars.AUTHENTICATOR_COOKIE_SIGNER_KEY=${AUTHENTICATOR_COOKIE_SIGNER_KEY} \
        -jvm.args='-Dconfig.resource=application.prod.conf -Dlogger.resource=logback.prod.xml'
