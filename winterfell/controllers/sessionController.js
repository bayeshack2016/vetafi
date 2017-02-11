var authenticatedOr404 = require('../middlewares/authenticatedOr404');
var express = require('express');
var Constants = require('../utils/constants');
var http = require('http-status-codes');

var router = express.Router();

var mw = [authenticatedOr404];

// Endpoint for updating the session TTL
router.get('/api/session/touch', mw, function (req, res) {
  // do nothing
});

module.exports = router;
