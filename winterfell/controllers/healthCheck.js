var express = require('express');
var http = require('http-status-codes');
var Log = require('../middlewares/log');

var router = express.Router();

/*
 This endpoint servers to check that the app web server is responding
 to requests as expected.
 Send a GET request to http://hostname:port/healthz
 and you should get a 200 (OK) status.
 */
router.get('/api/healthz', function (req, res) {
  Log.console('health OK!');
  res.sendStatus(http.OK);
});

module.exports = router;
