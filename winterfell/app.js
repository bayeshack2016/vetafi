#!/usr/bin/env node
var express = require('express');
var session = require('express-session');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var Constants = require('./utils/constants');
var ENVIRONMENT = Constants.environment;
var documentRenderingConfig = require('./config/documentRendering');

var environment = process.env.NODE_ENV || ENVIRONMENT.LOCAL;
var Biscuit = require('./services/biscuit');

var app = express();
app.set('secretsFile', require('./config/biscuit')[environment]);
var biscuit = new Biscuit(app);

app.environment = environment;
app.baseUrl = Constants.baseUrl[app.environment];

// Setup biscuit keys
function setupBiscuitKey(keyName) {
  var yamlKey = Constants.biscuitKeys[keyName];
  var secret = biscuit.get(environment + '::' + yamlKey);
  app.set(keyName, secret);
}

setupBiscuitKey(Constants.KEY_LOB_API);
setupBiscuitKey(Constants.KEY_IDME_CLIENT_ID);
setupBiscuitKey(Constants.KEY_IDME_SECRET_ID);

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


// Serve static files
app.use(express.static(path.join(__dirname, '/webapp/build')));
app.get('/', function(req, resp) {
  resp.render('webapp/build/index.html');
});

// Connect to a mongodb server using mongoose
require('./config/mongoose')(environment);

// Set address of document rendering microservice
app.set('documentRenderingServiceAddress', documentRenderingConfig.address);

var port = 3999;
var server = app.listen(process.env.PORT || port);
server.app = app;
console.log("Listening on port " + port + ". Winter is coming!");

module.exports = server;
