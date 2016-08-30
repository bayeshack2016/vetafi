var RedisService = require('../services/redisService');
var http = require('http-status-codes');
var Constants = require('../utils/constants');
var auth = require('../middlewares/auth');

module.exports = function (app) {

  // Endpoint for updating the session TTL
  app.get('/session/touch', auth.authenticatedOr404, function(req, res) {
    console.log('[sessionTouch] request received');
  });
};
