var mongoose = require('mongoose');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var User = require('../models/user');
var UserService = require('./../services/userService');

module.exports = function (app) {

  // Get a user's information based on externalId
  app.get('/user/:extUserId', function (req, res) {
    console.log('[getUser] request received for ' + req.params.extUserId);
    User.findOne({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        res.status(http.OK).send({user: User.externalize(user)});
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      }
    });
  });

  // Modify a user's information - find by externalId
  app.post('/user/:extUserId/modify', function (req, res) {
    console.log('[modifyUser] request received for ' + JSON.stringify(req.body));
    res.status(http.OK).send({});
  });

  // Set a user account to INACTIVE - find by externalId
  app.delete('/user/:extUserId', function (req, res) {
    console.log('[deleteUser] request received for ' + req.params.extUserId);
    var callback = function (dbErr) {
      if (dbErr) {
        console.log('[deleteUser] Not found!');
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      } else {
        console.log('[deleteUser] Successfully deleted');
        // Destroy session
        req.session.destroy(function (redisErr) {
          if(redisErr) {
            console.log(redisErr);
            res.status(http.INTERNAL_SERVER_ERROR).send();
          } else {
            res.sendStatus(http.OK);
          }
        });
      }
    };
    User.findOne({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        UserService.setUserState(user.id, User.State.INACTIVE, callback);
      } else {
        res.sendStatus(http.NOT_FOUND);
      }
    });
  });

};
