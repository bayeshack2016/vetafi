var mung = require('express-mung');

var mainLog, apiLog;
function LogHelper(app) {
  this.app = app;
  mainLog = app.log;
  apiLog = app.logApi;

  // Log endpoint response
  app.use(mung.json(
    function transform(body, req, res) {
      var eventTag = req.method + " " + req.url;
      apiLog.info({
        response: {
          event: eventTag,
          body: body,
          status: res.statusCode
        }
      });
      return body;
    }
  ));
}

module.exports = LogHelper;

// Log console (info)
module.exports.console = function(msg) {
  mainLog.info(msg);
  console.log(msg);
};

// Log endpoint request (info)
module.exports.api = function(req, res, next) {
  var eventTag = req.method + " " + req.url;
  apiLog.info({
    request: {
      event: eventTag,
      params: req.params,
      query: req.query,
      body: req.body,
      session: req.session
    }
  });
  next();
};
