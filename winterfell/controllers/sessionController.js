var auth = require('../middlewares/auth');
var Constants = require('../utils/constants');
var http = require('http-status-codes');
var Log = require('../middlewares/log');
var RedisService = require('../services/redisService');

module.exports = function (app) {
  var mw = [auth.authenticatedOr404, Log.api];

  // Endpoint for updating the session TTL
  app.get('/session/touch', mw, function(req, res) {
    // do nothing
  });
};
