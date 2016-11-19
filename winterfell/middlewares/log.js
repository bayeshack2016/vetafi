var _ = require('lodash');
var bunyan = require('bunyan');
var mung = require('express-mung');
var uuid = require('uuid');

var mainLog, apiLog;

function Log(app) {
  mainLog = bunyan.createLogger({
    name: 'vetafi_' + app.environment,
    streams: [{
      stream: process.stdout,
      level: 'debug'
    }],
    serializers: {
      req: reqSerializer,
      resp: respSerializer
    }
  });
  apiLog = mainLog.child({widget_type: 'api'});

  // Api request logging (uses request serializer)
  app.use(function(req, res, next) {
    // Assigning a requestId gives us a way to
    // keep track of which requests correspond to which responses
    req.requestId = uuid.v4();
    logRequest(req);
    next();
  });

  // Api response logging (uses mung + response serializer)
  app.use(mung.json(function(body, req, resp) {
    apiLog.info({ resp: resp, body: body });
    return body;
  }));
}
module.exports = Log;

// Log a message (info), as well as on console
module.exports.console = function(msg) {
  mainLog.info(msg);
  console.log(msg);
};

module.exports.info = function(msg) {
  mainLog.info(msg);
};

module.exports.debug = function(msg) {
  mainLog.debug(msg);
};

module.exports.warn = function(msg) {
  mainLog.warn(msg);
};

module.exports.error = function(msg) {
  mainLog.error(msg);
};

/*
 * Helper methods
 */
function logRequest(req) {
  if (req.url && req.url.indexOf('/api/') > -1) {
    apiLog.info({req: req}); // only api endpoints should be level info
  } else {
    apiLog.debug({req: req}); // i.e. static asset requests should be level debug
  }
}

/*
 * Serializers
 */
function reqSerializer(req) {
  return {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: removePrivateFields(req.body),
      params: req.params,
      query: req.query,
      session: req.session,
      requestId: req.requestId
  };
}

function respSerializer(resp) {
  return {
    status: resp.statusCode,
    method: resp.req.method,
    url: resp.req.url,
    requestId: resp.req.requestId
  };
}

function removePrivateFields(body) {
  return _.omit(body, ['password']);
}
