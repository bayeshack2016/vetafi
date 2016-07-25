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

We use vagrant to manage our development environments. 
Currently we use virtual machines managed by VirtualBox for development.

Please see installation instructions for vagrant and VirtualBox below: 

## OS X

If you are on OSX the easiest was to get setup is to use the brew package manager.

- `brew cask install virtualbox`
- `brew install vagrant`

## Windows

Please see https://www.vagrantup.com/downloads.html for instructions.

One you are setup you can run `vagrant ssh` to shell into the development environment, and then run
`winterfell/start-server.sh` to start the server. Then browse to http://localhost:3999 in your local browser.

# Brought to you by:
- Aaron Hsu
- Jeff Quinn
- Bayes Impact (www.bayesimpact.org)
