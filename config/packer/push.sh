#!/bin/bash
export ATLAS_TOKEN=$(biscuit get -f ../biscuit/secrets.yaml prod::atlas_token)
packer push vetafi-ubuntu-14.04.4-server-amd64.json
