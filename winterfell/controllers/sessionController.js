var RedisService = require('../services/redisService');
var Constants = require('../utils/constants');

module.exports = function (app) {

  // Endpoint for checking if session still exists on server
  app.get('/session/check', function(req, res) {
    console.log('[sessionCheck] request received');
    if (req.session.key) {
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

  // Endpoint for updating session and increasing its TTL
  app.post('/session/extend', function (req, res) {
    console.log('[sessionCheck] request received for ' + JSON.stringify(req.body));
    if (req.session.key) {
      var client = RedisService.getClient();
      client.expire(req.session.key, Constants.SESSION_EXPIRE_TIME);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

};
