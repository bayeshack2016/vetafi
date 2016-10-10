var mung = require('express-mung');

var Log, ApiLog;
function LogHelper(app) {
  this.app = app;
  Log = app.log;
  ApiLog = app.logApi;

  // Log endpoint response
  app.use(mung.json(
    function transform(body, req, res) {
      var eventTag = req.method + " " + req.url;
      ApiLog.info({
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

// Log console
module.exports.logConsole = function(msg) {
  Log.info(msg);
  console.log(msg);
};

// Log endpoint request
module.exports.logApi = function(req, res, next) {
  var eventTag = req.method + " " + req.url;

  Log.info({
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
