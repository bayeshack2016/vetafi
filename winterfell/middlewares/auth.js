var http = require('http-status-codes');

function Auth(app) {
  this.app = app;
}

module.exports = Auth;

module.exports.authenticatedOr404 = function (req, res, next) {
  if (req.session.userId) {
    return next();
  }

  console.log("Not authed");
  res.sendStatus(http.NOT_FOUND);
};

module.exports.authenticatedOrRedirect = function (req, res, next) {
  if (req.session.userId)
    return next();

  res.redirect('/');
};
