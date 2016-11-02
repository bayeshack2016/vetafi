var Log = require('../middlewares/log');
var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

module.exports = function(environment) {
  var address = '0.0.0.0:27017'; // default
  if (environment == 'production') {
      address = 'something-else-in-production';
  }
  mongoose.connect('mongodb://' + address + '/vets');

  var db = mongoose.connection;
  db.on('error', function (err) {
    Log.console('Error connecting to database ' + err);
  });
  db.on('open', function () {
    Log.console('Database connection opened at ' + address);
  });
  db.on('disconnected', function (err) {
    Log.console('Database disconnected.');
  });
};
