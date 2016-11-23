var mongodb = require('mongodb');
var http = require('http-status-codes');
var log = require('./log');
var objectid = mongodb.ObjectId;

function ValidObjectId(app) {
  this.app = app;
}
module.exports = ValidObjectId;

module.exports.validateObjectIdParams = function (parameterNames) {

  function validateObjectIdMiddleware(req, res, next) {

    for (var i = 0; i < parameterNames.length; i++) {
      if (!objectid.isValid(req.params[parameterNames[i]])) {
        log.warn('Invalid object id parameter for ' + parameterNames[i] +
                 ': ' + req.params[parameterNames[i]]);
        res.sendStatus(http.NOT_FOUND);
        return;
      }
    }

    next();
  }

  return validateObjectIdMiddleware;
};
