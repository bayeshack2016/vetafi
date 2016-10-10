var Constants = require('../utils/constants');
var LogHelper = require('../utils/logHelper');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var RedisService = require('../services/redisService');

module.exports = function (app) {
  var port = 6379;
  var host = 'localhost';

  var redisClient = RedisService.getClient();
  redisClient.on('connect', function() {
    LogHelper.logConsole('Redis connected at ' + host + ':' + port);
  });
  redisClient.on('error', function(err) {
    LogHelper.logConsole('Redis error: ' + err);
  });
  redisClient.set('project', 'Vetafi');

  app.use(session({
      secret: 'ssshhhhh',
      // create new redis store.
      store: new redisStore({
        host: host,
        port: port,
        client: redisClient}),
      cookie: {maxAge: Constants.SESSION_EXPIRE_TIME}, // expires after 20 minutes
      saveUninitialized: false,
      resave: false
  }));

  return app;
};
