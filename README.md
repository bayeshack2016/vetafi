# Vetafi
Vetafi is a powerful, easy-to-use web-app that improves health claim filing experiences for U.S. veterans.

# We can help you...
- Research and manage your health file claims
    - Learn about your health benefits and entitlements
    - Track the status of your claims, including ones you have already filed. **Never lose your documents again!**
- File your health claims quickly and efficiently
  - We streamline complex health & military forms into simple questionnaires so they are easy to understand and you don't have to re-fill information.
- Automatically generate VA forms with your information already filled out!

# Demo
For our hackathon demo, please visit: http://vetafi.herokuapp.com/<br>
Our production site is coming soon! :smile:

# Developing

Currently we use VirtualBox / vagrant for development. Please see installation instructions for vagrant and VirtualBox below: 

## Setup AWS Credentials

All of the below steps assume that you have access to the vetafi AWS account.

In order to get access, an account will be created for you by the admins and you will be given an API key.

The api key is expected to be stored in `~/.aws/credentials` under the `[default]` section.

Contact `jeff@vetafi.org` to get an account created for you.

## OS X

If you are on OSX the easiest was to get setup is to use the brew package manager.

- `brew cask install virtualbox`
- `brew install vagrant`

## Windows

Please see https://www.vagrantup.com/downloads.html for instructions.

# Setup Vagrant Box

Before using the vagrant development environment for the first time, you must setup with:

```
vagrant plugin install vagrant-s3auth
vagrant up
```

To install the vetafi vagrant box.

One you are setup you can run `vagrant ssh` to shell into the development environment. 
This environment will allow you to run the app and tests locally, described further in `hardhome/README.md`. 

# Brought to you by:
- Aaron Hsu
- Jeff Quinn
- Bayes Impact (www.bayesimpact.org)
