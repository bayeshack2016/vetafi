var http = require('http-status-codes');
var User = require('./../models/user');

function Auth(app) {
  this.app = app;
}
module.exports = Auth;

module.exports.authenticatedOr404 = function (req, res, next) {
  if (req.session.userId) {
    return next();
  }

  res.sendStatus(http.NOT_FOUND);
};

module.exports.authenticatedOrRedirect = function (req, res, next) {
  if (req.session.userId)
    return next();

  res.redirect('/');
};
