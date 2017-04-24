#!/bin/bash

packer build -only=virtualbox-iso vetafi-ubuntu-16.04.2-server-amd64.json
