var client = require('redis').createClient();
var expressLimiter = require('express-limiter');
var Constants = require('../utils/constants');
var Log = require('./log');

/**
 * Adds a limiter if we are running in prod which globally
 * limits requests to 360 per hour.
 *
 * @param app Express app.
 */
function addLimiter(app) {
  if (app.environment === Constants.environment.PROD) {
    var limiter = expressLimiter(app, client);

    limiter({
      path: '/',
      method: 'all',
      lookup: ['connection.remoteAddress'],
      // 360 request per hour per address for all pages
      total: 360,
      expire: 1000 * 60 * 60,
      onRateLimited: function (req, res, next) {
        Log.warn("remoteAddress " + req.connection.remoteAddress + " limited");
        res.status(429).send('Rate limit exceeded');
      }
    });

    limiter({
      path: '/',
      method: 'all',
      lookup: ['user._id'],
      // 360 request per hour per user for all pages
      total: 360,
      expire: 1000 * 60 * 60,
      whitelist: function (req) {
        return typeof req.user === 'undefined';
      },
      onRateLimited: function (req, res, next) {
        Log.warn("user " + req.user._id + " limited");
        res.status(429).send('Rate limit exceeded');
      }
    });
  }
}

module.exports = addLimiter;
