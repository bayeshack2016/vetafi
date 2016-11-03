var Constants = require('../utils/constants');
var Log = require('./log');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var RedisService = require('../services/redisService');

module.exports = function (app) {
  var port = 6379;
  var host = 'localhost';

  var redisClient = RedisService.getClient();
  redisClient.on('connect', function() {
    Log.console('Redis connected at ' + host + ':' + port);
  });
  redisClient.on('error', function(err) {
    Log.console('Redis error: ' + err);
  });
  redisClient.set('project', 'Vetafi');


  var cookieConfig = {
    maxAge: Constants.SESSION_EXPIRE_TIME,
    path: '/'
  };

  if (app.environment === Constants.environment.PROD) {
    cookieConfig.secure = true;
    cookieConfig.httpOnly = true;
    cookieConfig.domain = app.baseUrl;
  }

  app.use(session({
      secret: app.get(Constants.SESSION_SECRET_ID),
      name: 'sessionId',
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
