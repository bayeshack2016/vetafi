#!/bin/bash
#
# Setup the the box. This runs as root
set -euxo pipefail

apt-get -y update

apt-get -y install curl

# You can install anything you need here.

export DEBIAN_FRONTEND=noninteractive

# To install the add-apt-repository utility
apt-get -y install software-properties-common python-software-properties

# Node 4.x
curl -sL https://deb.nodesource.com/setup_4.x | bash -
apt-get -y install nodejs

# MongoDB
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" |  tee /etc/apt/sources.list.d/mongodb-org-3.0.list
apt-get -y update
apt-get -y install mongodb-org

# Redis
add-apt-repository -y ppa:chris-lea/redis-server
apt-get -y update
apt-get -y install redis-server

# Install Java 8
apt-get -y install software-properties-common
add-apt-repository -y ppa:webupd8team/java
apt-get -y update
echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections
echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections
apt-get -y install oracle-java8-installer
# Set default java
apt-get -y install oracle-java8-set-default
