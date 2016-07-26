module.exports = function (app) {

  // Endpoint for checking if session still exists on server
  app.get('/session/check', function(req, res) {
    console.log('[sessionCheck] request received');
    if (req.session.key) {
      res.redirect('/');
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

};
