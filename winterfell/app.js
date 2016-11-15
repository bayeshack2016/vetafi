#!/usr/bin/env node
var Biscuit = require('./services/biscuit');
var Constants = require('./utils/constants');
var documentRenderingConfig = require('./config/documentRendering');
var express = require('express');
var fs = require('fs');
var Log = require('./middlewares/log');
var path = require('path');
var session = require('express-session');
var helmet = require('helmet');
var ENVIRONMENT = Constants.environment;
var environment = process.env.NODE_ENV || ENVIRONMENT.LOCAL;
var https = require('https');

// Initialize App
var app = express();
app.use(helmet());
app.environment = environment;
app.baseUrl = Constants.baseUrl[app.environment];
console.log("App created.");

// Initialize Biscuit
app.set('secretsFile', require('./config/biscuit')[environment]);
var biscuit = new Biscuit(app);

function setupBiscuitKey(keyName) {
  var yamlKey = Constants.biscuitKeys[keyName];
  var secret = biscuit.get(environment + '::' + yamlKey);
  app.set(keyName, secret);
}
setupBiscuitKey(Constants.KEY_LOB_API);
setupBiscuitKey(Constants.KEY_IDME_CLIENT_ID);
setupBiscuitKey(Constants.KEY_IDME_SECRET_ID);
setupBiscuitKey(Constants.SESSION_SECRET_ID);
console.log("Biscuit keys configured.");

// Set address of document rendering microservice
app.set('documentRenderingServiceAddress', documentRenderingConfig.address);
console.log("DocumentRendering microservice assigned.");

// Initialize Node Modules
function loadIntoBuild (app, targetDir) {
  var normalizedPath = path.join(__dirname, targetDir);
  fs.readdirSync(normalizedPath).forEach(function (file) {
    console.log('loading', normalizedPath + '/' + file);
    require(normalizedPath + '/' + file)(app);
  });
  return app;
}
loadIntoBuild(app, 'utils');
loadIntoBuild(app, 'middlewares');
loadIntoBuild(app, 'services');
loadIntoBuild(app, 'controllers');
console.log("Node modules loaded.");

// Logger has been initialized
Log.console("New logger created.");

// Connect to a mongodb server using mongoose
require('./config/mongoose')(environment);

// Set templating engine
app.set('view engine', 'pug');

// Serve static files
app.use(express.static(path.join(__dirname, '/webapp/build')));

app.get('/', function(req, resp) {
  resp.render('webapp/build/index.html');
});

// Start server
var devPort = 3999, server;
if (environment === Constants.environment.PROD) {
  server = https.createServer({
    cert: biscuit.get(environment + '::' + 'ssl-cert'),
    key: biscuit.get(environment + '::' + 'ssl-key')
  }, app).listen(443);
  Log.console("Listening on port 443. Winter is coming!");
} else {
  server = app.listen(process.env.PORT || devPort);
  Log.console("Listening on port " + (process.env.PORT || devPort) + ". Winter is coming!");
}

server.app = app;
module.exports = server;

