var csurf = require('csurf');
var cookieParser = require('cookie-parser');

function addCsurf(app) {
  app.use(cookieParser());
  // CSRF protection
  app.use(csurf({cookie: true}));
  app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
}


module.exports = addCsurf;


