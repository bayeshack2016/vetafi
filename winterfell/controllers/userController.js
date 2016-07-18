var lodash = require('lodash');
var mongoose = require('mongoose');
var User = require('../models/user');
var UserService = require('./../services/userService');

module.exports = function (app) {

  // Get a user's information based on externalId
  app.get('/user/:extUserId', function (req, res) {
    console.log('[getUser] request received for ' + req.params.extUserId);
    User.getByExtId(req.params.extUserId, function(err, user) {
      if (user) {
        res.status(200).send({user: User.externalize(user)});
      } else {
        res.sendStatus(404);
      }
    });
  });

  // Modify a user's information - find by externalId
  app.post('/user/:extUserId/modify', function (req, res) {
    console.log('[modifyUser] request received for ' + JSON.stringify(req.body));
    res.sendStatus(200);
  });

  // Set a user account to INACTIVE - find by externalId
  app.delete('/user/:extUserId', function (req, res) {
    console.log('[deleteUser] request received for ' + req.extUserId);
    var query = { externalId: req.extUserId };
    var update = { state: User.State.INACTIVE };
    User.update({ externalId: req.extUserId }, function(err) {
      if (err) {
        console.log('[deleteUser] Not found! ' + req.extUserId);
      } else {
        console.log('[deleteUser] Successfully deleted ' + req.extUserId);
      }
    });
    res.sendStatus(200);
  });

};
