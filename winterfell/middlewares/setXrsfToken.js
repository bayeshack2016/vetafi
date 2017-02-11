module.exports = function (req, res, next) {
  // Set the token in the XSRF-TOKEN, which is recognized and set on
  // with angular $http requests, and then recognized by the csurf
  // middleware.
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
};
