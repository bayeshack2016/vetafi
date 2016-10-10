var auth = require('../middlewares/auth');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var LogHelper = require('./../utils/logHelper');
var mongoose = require('mongoose');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('./../services/userService');

module.exports = function (app) {
  var middlewares = [auth.authenticatedOr404, LogHelper.logApi];

  // Get a user's information based on externalId
  app.get('/user', middlewares, function (req, res) {
    User.findById(req.session.userId).exec(function(err, user) {
      if (user) {
        res.status(http.OK).send({user: User.externalize(user)});
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      }
    });
  });

  // Modify a user's information - find by externalId
  app.post('/user/:extUserId/modify', middlewares, function (req, res) {
    res.sendStatus(http.OK);
  });

  // Set a user account to INACTIVE - find by externalId
  app.delete('/user', middlewares, function (req, res) {
    var callback = function (dbErr) {
      if (dbErr) {
        console.log('[deleteUser] Not found!');
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      } else {
        console.log('[deleteUser] Successfully deleted');
        // Destroy session
        req.session.destroy(function (redisErr) {
          if(redisErr) {
            res.status(http.INTERNAL_SERVER_ERROR).send();
          } else {
            res.sendStatus(http.OK);
          }
        });
      }
    };
    User.findById(req.session.userId).exec(function(err, user) {
      if (user) {
        UserService.setUserState(user.id, User.State.INACTIVE, callback);
      } else {
        res.sendStatus(http.NOT_FOUND);
      }
    });
  });

  app.get('/user/values', middlewares, function(req, res) {
    User.findById(req.session.userId).exec(function(err, user) {
      if (err) {
        res.status(http.INTERNAL_SERVER_ERROR).send();
        return;
      }

      if (user) {
        UserValues.findOne({userId: user._id}).exec(function(err, userValues) {
          res.status(http.OK).send({ values: userValues || {} });
        });
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      }
    });
  });

  app.post('/user/values', middlewares, function(req, res) {
    var valuesToUpdate = req.body.values;
    if (valuesToUpdate && valuesToUpdate.key && valuesToUpdate.value) {
      User.findById(req.session.userId).exec(function(err, user) {
        if (err) {
          res.status(http.INTERNAL_SERVER_ERROR).send();
          return;
        }

        if (user) {
          UserService.updateUserValue(user._id, valuesToUpdate.key, valuesToUpdate.value);
        } else {
          res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
        }
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_INPUT});
    }
  });

};
