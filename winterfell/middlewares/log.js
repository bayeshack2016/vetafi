var bunyan = require('bunyan');
var mung = require('express-mung');
var uuid = require('uuid');

var mainLog, apiLog;

function Log(app) {
  mainLog = bunyan.createLogger({
    name: 'vetafi_' + app.environment,
    streams: [{
      path: '../logs/app.js' // todo: these logs need to be moved into the same level
    }]
  });
  apiLog = mainLog.child({widget_type: 'api'});

  // Log api endpoint responses
  app.use(mung.json(logApiResp));
};
module.exports = Log;

// Log a message (info), as well as on console
module.exports.console = function(msg) {
  mainLog.info(msg);
  console.log(msg);
};

// Log endpoint request (info)
module.exports.api = function(req, res, next) {
  var eventTag = req.method + " " + req.url;
  req.requestId = uuid.v4();
  apiLog.info({
    request: {
      event: eventTag,
      params: req.params,
      query: req.query,
      body: req.body,
      session: req.session,
      requestId: req.requestId
    }
  });
  next();
};

// Log endpoint response (info)
function logApiResp(body, req, res) {
  var eventTag = req.method + " " + req.url;
  apiLog.info({
    response: {
      event: eventTag,
      body: body,
      status: res.statusCode,
      requestId: req.requestId
    }
  });
  return body;
}
