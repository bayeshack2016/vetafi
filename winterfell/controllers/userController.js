var lodash = require('lodash');
var mongoose = require('mongoose');
var User = require('../models/user');
var UserService = require('./../services/userService');

/*
  This endpoint servers creates a new user.
  Return 200 (OK) if user successfully created
  Return 400 (BAD_REQUEST) if user already exists or request is invalid
*/
module.exports = function (app) {

  app.post('/user/:extUserId/modify', function (req, res) {
    console.log('[modifyUser] request received for ' + JSON.stringify(req.body));
    res.sendStatus(200);
  });

  app.delete('/user/:extUserId', function (req, res) {
    
    res.sendStatus(200);
  });

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

};
