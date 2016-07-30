var mongoose = require('mongoose');
var http = require('../utils/httpResponses');
var User = require('../models/user');
var UserService = require('./../services/userService');

module.exports = function (app) {

  // Get a user's information based on externalId
  app.get('/user/:extUserId', function (req, res) {
    console.log('[getUser] request received for ' + req.params.extUserId);
    User.findOne({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        res.status(http.CODE_SUCCESS).send({user: User.externalize(user)});
      } else {
        res.status(http.CODE_NOT_FOUND).send({error: http.ERROR_USER_NOT_FOUND});
      }
    });
  });

  // Modify a user's information - find by externalId
  app.post('/user/:extUserId/modify', function (req, res) {
    console.log('[modifyUser] request received for ' + JSON.stringify(req.body));
    res.status(http.CODE_SUCCESS).send({});
  });

  // Set a user account to INACTIVE - find by externalId
  app.delete('/user/:extUserId', function (req, res) {
    console.log('[deleteUser] request received for ' + req.params.extUserId);
    var callback = function (dbErr) {
      if (dbErr) {
        console.log('[deleteUser] Not found!');
        res.status(http.CODE_NOT_FOUND).send({error: http.ERROR_USER_NOT_FOUND});
      } else {
        console.log('[deleteUser] Successfully deleted');
        // Destroy session
        req.session.destroy(function (redisErr) {
          if(redisErr) {
            console.log(redisErr);
            res.status(http.CODE_INTERNAL_SERVER_ERROR);
          } else {
            res.status(http.CODE_SUCCESS);
          }
        });
      }
    };
    User.findOne({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        UserService.setUserState(user.id, User.State.INACTIVE, callback);
      } else {
        res.status(http.CODE_NOT_FOUND);
      }
    });
  });

};
