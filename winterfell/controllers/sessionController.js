var auth = require('../middlewares/auth');
var Constants = require('../utils/constants');
var http = require('http-status-codes');
var LogHelper = require('../utils/logHelper');
var RedisService = require('../services/redisService');

module.exports = function (app) {
  var middlewares = [auth.authenticatedOr404, LogHelper.logApi];

  // Endpoint for updating the session TTL
  app.get('/session/touch', middlewares, function(req, res) {
    // do nothing
  });
};
