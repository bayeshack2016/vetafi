# Setting up Winterfell
Winterfell is the server that handles all control logic in the application. This includes authentication, handling user information, it is basically the bulk of the main logistics.

### Install Node
This project is designed to work with node.js v5. 

If you haven't already, we'll need to install node. Run the following at the same directory level as _package.json_.
```
$ npm install
```

### Install MongoDb No-SQL Database
Refer to the [MongoDb installation page](https://docs.mongodb.com/master/installation/) to install.
We used Homebrew to install Mongo.
```
$ brew install mongodb
```

### Install Redis In-Memory DataStore
We used NPM to install [Redis](http://redis.io/).
```
$ npm install redis
```

## Running Winterfell locally
Make sure a _MongoDb_ instance is started in a separate terminal, we assume the database is on port 27017.
```
$ mongod
```
or
```
$ ./start-mongod.sh
```

Make sure a _Redis_ instance is started in a separate terminal, we assume the database is on port 6379.
```
$ redis-server
```
or
```
$ ./start-redis.sh
```

Simply run the _start.sh_ script from the command line. The server should start up at port 3999.
```
$ ./start-server.sh
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
