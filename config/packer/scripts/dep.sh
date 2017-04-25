#!/bin/bash
#
# Setup the the box. This runs as root
set -euxo pipefail

apt-get -y update

apt-get -y install curl

# You can install anything you need here.

export DEBIAN_FRONTEND=noninteractive

# Install tools
sudo apt install git
sudo apt install awscli
# This is needed to build debs from the play-framework app
sudo apt install fakeroot

# To install the add-apt-repository utility
apt-get -y install software-properties-common python-software-properties

# Node 5.x
apt-get -y install nodejs

# MongoDB
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
apt-get -y update
apt-get -y install mongodb-org
systemctl enable mongod.service
systemctl daemon-reload

echo "
[Unit]
Description=High-performance, schema-free document-oriented database
After=network.target
Documentation=https://docs.mongodb.org/manual

[Service]
User=mongodb
Group=mongodb
ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf

[Install]
WantedBy=multi-user.target" | tee /lib/systemd/system/mongod.service


# Install Java 8
apt-get -y -f install openjdk-8-jdk

# Install scala
wget https://downloads.lightbend.com/scala/2.11.8/scala-2.11.8.deb
dpkg -i scala-2.11.8.deb
apt-get update
apt-get -y -f install scala
rm scala-2.11.8.deb

# Install sbt
echo "deb https://dl.bintray.com/sbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823
apt-get update
apt-get -y install sbt

# Biscuit (secrets management)
wget https://github.com/dcoker/biscuit/releases/download/v0.1.2/biscuit-linux_amd64.tgz
tar -xzvf biscuit-linux_amd64.tgz
mv biscuit /usr/local/bin/biscuit
chmod +x /usr/local/bin/biscuit
rm -f biscuit-linux_amd64.tgz
rm -f biscuit-java-master-SNAPSHOT.jar

# Install certbot
sudo add-apt-repository -y ppa:certbot/certbot
sudo apt-get -y update
sudo apt-get -y install certbot
