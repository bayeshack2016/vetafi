#!/bin/bash
#
# Setup the the box. This runs as root
set -euxo pipefail

sudo apt-get -y update

sudo apt-get -y install curl

# You can install anything you need here.

export DEBIAN_FRONTEND=noninteractive

# To install the add-apt-repository utility
sudo apt-get -y install software-properties-common python-software-properties

# Node 5.x
sudo apt-get -y install nodejs

# MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get -y update
sudo apt-get -y install mongodb-org

# Install Java 8
sudo apt-get -y install software-properties-common
sudo add-apt-repository -y ppa:webupd8team/java
sudo apt-get -y update
echo debconf shared/accepted-oracle-license-v1-1 select true | sudo debconf-set-selections
echo debconf shared/accepted-oracle-license-v1-1 seen true | sudo debconf-set-selections
sudo apt-get -y install oracle-java8-installer
# Set default java
sudo apt-get -y install oracle-java8-set-default

# Install scala
wget https://downloads.lightbend.com/scala/2.11.8/scala-2.11.8.deb
sudo dpkg -i scala-2.11.8.deb
sudo apt-get update
sudo apt-get install scala

# Install sbt
echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823
sudo apt-get update
sudo apt-get install sbt

# Biscuit (secrets management)
wget https://github.com/dcoker/biscuit/releases/download/v0.1.2/biscuit-linux_amd64.tgz
tar -xzvf biscuit-linux_amd64.tgz
sudo mv biscuit /usr/local/bin/biscuit
sudo chmod +x /usr/local/bin/biscuit
rm biscuit-linux_amd64.tgz
