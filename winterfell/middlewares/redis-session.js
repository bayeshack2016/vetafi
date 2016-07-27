var session = require('express-session');
var cookieParser = require('cookie-parser');
var redis = require('redis');
var redisStore = require('connect-redis')(session);

module.exports = function (app) {
  var port = 6379;
  var host = 'localhost';

  var redisClient = redis.createClient();
  redisClient.on('connect', function() {
      console.log('Redis connected at ' + host + ':' + port);
  });
  redisClient.on('error', function(err) {
      console.log('Redis error: ' + err);
  });
  redisClient.set('project', 'Vetafi');

  app.use(session({
      secret: 'ssshhhhh',
      // create new redis store.
      store: new redisStore({
        host: host,
        port: port,
        client: redisClient,
        ttl :  1200}), // expires after 20 minutes
      saveUninitialized: false,
      resave: false
  }));

  return app;
};
