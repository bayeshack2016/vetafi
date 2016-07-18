var lodash = require('lodash');
var passport = require('passport');
var User = require('./../models/user');
var UserService = require('./../services/userService');

module.exports = function (app) {

  // Endpoint for routing sign-up
  app.get('/signup', function(req, res) {
    console.log('[signup] request received for ' + JSON.stringify(req.body));
    console.log('[signup] session for ' + JSON.stringify(req.session));
    if (req.session.key) {
      res.redirect('/');
    } else {
      res.sendFile('signup.html', {root: './webapp/build/templates'});
    }
  });

  // Endpoint for routing login
  app.get('/login', function(req, res) {
    console.log('[login] request received for ' + JSON.stringify(req.body));
    console.log('[login] session for ' + JSON.stringify(req.session));
    if (req.session.key) {
      res.redirect('/');
    } else {
      res.sendFile('login.html', {root: './webapp/build/templates'});
    }
  });

  // Endpoint to authenticate sign-ups and begin session
  app.post('/auth/signup', function(req, res) {
    console.log('[authSignUp] request received for ' + JSON.stringify(req.body));
    var user = {
      email: req.body.email,
      password: req.body.password
    };
    var callbacks = {
      onError: function(errorCode, errorMsg) {
        console.log('[authSignUp] ' + errorCode + ' Error creating user: ' + errorMsg);
        res.sendStatus(errorCode, errorMsg);
      },
      onSuccess: function(user) {
        console.log('[authSignUp] Successfully created user ' + user.externalId);
        res.sendStatus(200);
      }
    };
    UserService.createNewUser(user, callbacks);
  });

  // Endpoint to authenticate logins and begin session
  app.post('/auth/login', passport.authenticate('local'), function(req, res) {
    console.log('[authLogIn] request received for ' + JSON.stringify(req.body));
    if (req.user) {
      req.session.key = req.body.email;
      var extUserId = req.user.externalId;
      res.status(200).send({userId: extUserId, redirect: '/'});
    } else {
      res.status(403);
    }
  });

  // Endpoint to logout and remove session
  app.get('/auth/logout', function(req, res) {
    console.log('[authLogOut] log out for ' + JSON.stringify(req.session));
    req.session.destroy(function (err) {
        if(err){
            console.log(err);
            res.end('done');
        } else {
            res.redirect('/');
        }
    });
  });

};
