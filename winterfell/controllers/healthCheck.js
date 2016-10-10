var http = require('http-status-codes');
var Log = require('./../utils/logHelper');
/*
  This endpoint servers to check that the app web server is responding
  to requests as expected.
  Send a GET request to http://hostname:port/healthz
  and you should get a 200 (OK) status.
*/
module.exports = function (app) {
  app.get('/healthz', [Log.api], function (req, res) {
    Log.console('health OK!');
    res.sendStatus(http.OK);
  });
};
