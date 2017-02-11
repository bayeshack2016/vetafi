var auth = require('../middlewares/auth');
var express = require('express');
var Constants = require('../utils/constants');
var http = require('http-status-codes');
var RedisService = require('../services/redisService');

var router = express.Router();

var mw = [auth.authenticatedOr404];

// Endpoint for updating the session TTL
app.get('/api/session/touch', mw, function (req, res) {
  // do nothing
});

module.exports = router;
