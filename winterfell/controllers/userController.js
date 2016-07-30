var mongoose = require('mongoose');
var User = require('../models/user');
var UserService = require('./../services/userService');

module.exports = function (app) {

  // Get a user's information based on externalId
  app.get('/user/:extUserId', function (req, res) {
    console.log('[getUser] request received for ' + req.params.extUserId);
    User.find().byExternalId(req.params.extUserId).exec(function(err, user) {
      if (user) {
        res.status(200).send({user: user.externalize()});
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
    console.log('[deleteUser] request received for ' + req.params.extUserId);
    var callback = function (dbErr) {
      if (dbErr) {
        console.log('[deleteUser] Not found!');
        res.sendStatus(400);
      } else {
        console.log('[deleteUser] Successfully deleted');
        // Destroy session
        req.session.destroy(function (redisErr) {
            if(redisErr) {
                console.log(redisErr);
                res.end('done');
            } else {
                res.sendStatus(200);
            }
        });
      }
    };
    User.find().byExternalId(req.params.extUserId).exec(function(err, user) {
      if (user) {
        UserService.setUserState(user.id, User.State.INACTIVE, callback);
      } else {
        res.sendStatus(404);
      }
    });
  });

};
