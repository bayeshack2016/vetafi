#!/bin/bash
# Usage: ./build_vbox.sh
# Description: This will build a new vritualbox image and upload it to s3.

set -eux -o pipefail

packer build -only=virtualbox-iso vetafi-ubuntu-16.04.2-server-amd64.json
aws s3 cp packer_virtualbox-iso_virtualbox.box s3://vetafi/virtualbox/vetafi-ubuntu-16.04.2-server-amd64.box
