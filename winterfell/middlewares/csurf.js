var csurf = require('csurf');
var cookieParser = require('cookie-parser');

function addCsurf(app) {
  app.use(cookieParser());
  // CSRF protection
  app.use(csurf({cookie: true}));
  app.use(function (req, res, next) {
    // Set the token in the XSRF-TOKEN, which is recognized and set on
    // with angular $http requests, and then recognized by the csurf
    // middleware.
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
}

module.exports = addCsurf;
