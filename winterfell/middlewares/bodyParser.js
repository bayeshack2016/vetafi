/**
 * Setup the body-parser middleware, which parses POSTed JSON.
 */
var bodyParser = require('body-parser');

module.exports = function (app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
};