#!/usr/bin/env node
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csurf = require('csurf');
var documentRenderingConfig = require('./config/documentRendering');
var enforce = require('express-sslify');
var express = require('express');
var helmet = require('helmet');
var http = require('http');
var https = require('https');
var path = require('path');
var Biscuit = require('./services/biscuit');
var Constants = require('./utils/constants');
var ENVIRONMENT = Constants.environment;
var Log = require('./middlewares/log');


// Initialize App
var app = express();
app.use(helmet());

// Log errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  next(err);
});

var environment = process.env.NODE_ENV || ENVIRONMENT.LOCAL;
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


// Set oAuth URL
var idmeUrlLocal = "https://api.id.me/oauth/authorize?client_id=684c7204feed7758b25527eae2d66e28&redirect_uri=http://localhost:3999/auth/idme/callback&response_type=code&scope=military";
var idmeUrlProd = "https://api.id.me/oauth/authorize?client_id=71ffbd3f04241a56e63fa6a960fbb15e&redirect_uri=https://www.vetafi.org/auth/idme/callback&response_type=code&scope=military";
var idmeUrl = app.environment == Constants.environment.LOCAL ? idmeUrlLocal : idmeUrlProd;

app.set('idMeOAuthUrl', idmeUrl);

/**
 * Setup the body-parser middleware, which parses POSTed JSON.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());
// CSRF protection
app.use(csurf({cookie: true}));
app.use(require('./middlewares/setXrsfToken.js'));

if (app.environment === Constants.environment.PROD) {
  require('./middlewares/expressLimiter')(app);
}

require('./middlewares/passport')(app);
require('./middlewares/redis-session')(app);
require('./middlewares/log')(app);

app.use(require('./controllers/adminController'));
app.use(require('./controllers/authController'));
app.use(require('./controllers/claimController'));
app.use(require('./controllers/healthCheck'));
app.use(require('./controllers/sessionController'));
app.use(require('./controllers/userController'));

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
  }, app);

  var redirectServer = http.createServer(app);
  app.use(enforce.HTTPS());
  server.listen(443);
  redirectServer.listen(80);

  Log.console("Listening on port 443. Winter is coming!");
} else {
  server = app.listen(process.env.PORT || devPort);
  Log.console("Listening on port " + (process.env.PORT || devPort) + ". Winter is coming!");
}

server.app = app;
module.exports = server;
