# Setting up Winterfell
Winterfell is the server that handles all control logic in the application. This includes authentication, handling user information, it is basically the bulk of the main logistics.

### Install Node Modules
This project is designed to work with node.js v4.x.

If you haven't already, we'll need to install node. Run the following at the same directory level as _package.json_.
```
$ npm install
```

### Startup Vagrant

```
$ vagrant up
```

### Run tests

```
$ vagrant up
$ vagrant ssh
$ ./run-tests.sh
```

## Codebase Organization
The codebase directories are organized as such:
- config		    configuration utilities to help bind together third-party services
- controllers		endpoint logic for requests
- services		  app logic to manipulate databases
- models		    database access objects that represent db tables
- middlewares		utilities to help process requests before hitting the controllers
- tests         unit tests
- utils         general programming utilities and constants
- webapp        the front-end web application to be served
