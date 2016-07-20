var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

var environment = process.env.NODE_ENV || 'local';
var app = express();

app.environment = environment;

function loadIntoBuild (app, targetDir) {
  var normalizedPath = path.join(__dirname, targetDir);
  fs.readdirSync(normalizedPath).forEach(function (file) {
    require(normalizedPath + '/' + file)(app);
  });
  return app;
}
loadIntoBuild(app, 'middlewares');
loadIntoBuild(app, 'services');
loadIntoBuild(app, 'controllers');

// Serve static files
app.use(express.static(path.join(__dirname, '/webapp/build')));
app.get('/', function(req, resp) {
  resp.render('webapp/build/index.html');
});

// Connect to a mongodb server using mongoose
require('./config/mongoose')(environment);

var port = 3999;
app.listen(process.env.PORT || port);
console.log("Listening on port " + port + ". Winter is coming!");
