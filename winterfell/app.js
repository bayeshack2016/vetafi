#!/usr/bin/env node
var Biscuit = require('./services/biscuit');
var bunyan = require('bunyan');
var Constants = require('./utils/constants');
var documentRenderingConfig = require('./config/documentRendering');
var express = require('express');
var fs = require('fs');
var LogHelper = require('./utils/logHelper');
var path = require('path');
var session = require('express-session');

var ENVIRONMENT = Constants.environment;
var environment = process.env.NODE_ENV || ENVIRONMENT.LOCAL;

// Initialize App
var app = express();
app.environment = environment;
app.baseUrl = Constants.baseUrl[app.environment];

// Initialize Logger
var log = bunyan.createLogger({
  name: 'vetafi_' + environment,
  streams: [{
    path: '../logs/app.js'
  }]
});
app.log = log;
app.logApi = app.log.child({widget_type: 'api'});
app.log.info("New logger created.");

// Initialize Node Modules`
function loadIntoBuild (app, targetDir) {
  var normalizedPath = path.join(__dirname, targetDir);
  fs.readdirSync(normalizedPath).forEach(function (file) {
    require(normalizedPath + '/' + file)(app);
  });
  return app;
}
loadIntoBuild(app, 'utils');
loadIntoBuild(app, 'middlewares');
loadIntoBuild(app, 'services');
loadIntoBuild(app, 'controllers');
LogHelper.logConsole("Node modules loaded.");

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
LogHelper.logConsole("Biscuit setup.");

// Serve static files
app.use(express.static(path.join(__dirname, '/webapp/build')));
app.get('/', function(req, resp) {
  resp.render('webapp/build/index.html');
});

// Connect to a mongodb server using mongoose
require('./config/mongoose')(environment);

// Set address of document rendering microservice
app.set('documentRenderingServiceAddress', documentRenderingConfig.address);

// Start server
var port = 3999;
var server = app.listen(process.env.PORT || port);
server.app = app;
module.exports = server;
LogHelper.logConsole("Listening on port " + port + ". Winter is coming!");
