var RedisService = require('../services/redisService');
var http = require('http-status-codes');
var Constants = require('../utils/constants');

module.exports = function (app) {

  // Endpoint for updating the session TTL
  app.get('/session/touch', function(req, res) {
    console.log('[sessionTouch] request received');
    if (req.session.key) {
      res.sendStatus(http.OK);
    } else {
      console.log('[sessionTouch] session expired!');
      res.sendStatus(http.UNAUTHORIZED);
    }
  });
};
