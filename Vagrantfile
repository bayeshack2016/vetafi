# -*- mode: ruby -*-
# vi: set ft=ruby :
ENV.delete_if { |name| name.start_with?('AWS_') }  # Filter out rogue env vars.
ENV['AWS_PROFILE'] = 'default'

Vagrant.configure("2") do |config|
  config.vm.box     = 'vetafi-ubuntu-16.04.2-server-amd64'
  config.vm.box_url = 's3://vetafi/virtualbox/vetafi-ubuntu-16.04.2-server-amd64.box'
  config.vm.network "forwarded_port", guest: 9000, host: 9000
  config.vm.synced_folder "~/.aws", "/home/vagrant/.aws"
end
