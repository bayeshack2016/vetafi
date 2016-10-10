var LogHelper = require('../utils/logHelper');
var mongoose = require('mongoose');

module.exports = function(environment) {
  var address = '0.0.0.0:27017'; // default
  if (environment == 'production') {
      address = 'something-else-in-production';
  }
  mongoose.connect('mongodb://' + address + '/vets');

  var db = mongoose.connection;
  db.on('error', function (err) {
    LogHelper.logConsole('Error connecting to database ' + err);
  });
  db.on('open', function () {
    LogHelper.logConsole('Database connection opened at ' + address);
  });
  db.on('disconnected', function (err) {
    LogHelper.logConsole('Database disconnected.');
  });
};
