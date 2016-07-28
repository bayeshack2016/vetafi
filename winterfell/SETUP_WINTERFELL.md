# Setting up Winterfell
Winterfell is the server that handles all control logic in the application. This includes authentication, handling user information, it is basically the bulk of the main logistics.

### Install Node Modules
This project is designed to work with node.js v5.x.

If you haven't already, we'll need to install node. Run the following at the same directory level as _package.json_.

```
$ brew install node
$ npm install
```

### Startup Vagrant

```
$ vagrant up
```

### Run Tests

```
$ vagrant ssh
$ cd /vagrant/winterfell
$ ./run-tests.sh
```

### Run Server

```
$ vagrant ssh
$ cd /vagrant/winterfell
$ ./start-server.sh
```

And navigate to http://localhost:3999 in your local browser.

## Codebase Organization
The codebase directories are organized as such:
- config		    configuration utilities to help bind together third-party services
- controllers		endpoint logic for requests
- services		  app logic to manipulate databases
- models		    database access objects that represent db tables
- middlewares		utilities to help process requests before hitting the controllers
- pdf-filler    PDF rendering microservice
- tests         unit tests
- utils         general programming utilities and constants
- webapp        the front-end web application to be served
