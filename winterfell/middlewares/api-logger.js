/**
 * Setup an endpoint middleware that logs incoming requests and intercepts outgoing responses
 */
var mung = require('express-mung');
var Log;

function ApiLog(app) {
  this.app = app;
  Log = app.log.child({widget_type: 'api'});

  // Log endpoint response
  app.use(mung.json(
    function transform(body, req, res) {
      var eventTag = req.method + " " + req.url;
      Log.info({
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
module.exports = ApiLog;

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
