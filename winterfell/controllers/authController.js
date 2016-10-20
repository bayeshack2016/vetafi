var _ = require('lodash');
var constants = require('./../utils/constants');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var passport = require('passport');
var User = require('./../models/user');
var UserValues = require('./../models/userValues');
var UserService = require('./../services/userService');

module.exports = function (app) {

  // Endpoint for routing sign-up
  app.get('/signup', function(req, res) {
    if (req.session.key) {
      res.redirect('/');
    } else {
      res.sendFile('signup.html', {root: './webapp/build/templates/noangular'});
    }
  });

  // Endpoint for routing login
  app.get('/login', function(req, res) {
    if (req.session.key) {
      res.redirect('/');
    } else {
      res.sendFile('login.html', {root: './webapp/build/templates/noangular'});
    }
  });

  // Endpoint to authenticate sign-ups and begin session
  app.post('/api/auth/signup', function(req, res) {
    var data = {
      email: req.body.email,
      password: req.body.password
    };

    // First find a user with this email
    User.findOne({email: data.email, state: User.State.ACTIVE}, function (err, user) {
      if (_.isEmpty(user)) { // User does not exist, create a new one!
        UserService.createNewUser(data, function(err, user) {
          if (err) {
            res.sendStatus(http.INTERNAL_SERVER_ERROR);
            return;
          }
          console.log('[authSignUp] Successfully created user ' + user.externalId);
          var extUserId = user.externalId;
          UserValues.create(
            {userId: user._id},
            function (error, userValues) {
              if (error) {
                res.sendStatus(http.INTERNAL_SERVER_ERROR);
                console.error(error);
                return;
              }
              req.login(user, function(err) {
                if (err) { return next(err); }
                req.session.key = req.body.email;
                req.session.userId = req.user._id;
                return res.status(http.OK).send({redirect: '/'});
              });
            }
          );
        });
      } else { // User does exist!
          res.status(http.BAD_REQUEST).send({error: httpErrors.USER_EXISTS});
      }
    });
  });

  // Endpoint to authenticate logins and begin session
  app.post('/api/auth/login', [passport.authenticate('local')], function(req, res) {
    if (req.user) {
      req.session.key = req.body.email;
      req.session.userId = req.user._id;
      var extUserId = req.user.externalId;
      res.status(http.OK).send({userId: extUserId, redirect: '/'});
    } else {
      res.status(http.UNAUTHORIZED);
    }
  });

  // Endpoint to logout and remove session
  app.get('/api/auth/logout', function(req, res) {
    req.session.destroy(function (err) {
        if(err) {
            res.sendStatus(http.INTERNAL_SERVER_ERROR);
        } else {
            res.redirect('/');
        }
    });
  });


  /*
   * OAuth Endpoints
   */

  // Id.Me oauth endpoint
  app.get('/api/auth/idme',
    [
      passport.authenticate('idme', {scope: 'military'})
    ]
  );

  // Id.Me oauth callback endpoint
  // If authorization was granted, the user will be logged in.
  // Otherwise, authentication has failed.
  app.get('/api/auth/idme/callback',
    [
      passport.authenticate('idme', {
        successRedirect: '/',
        failureRedirect: '/login'
      })
    ]
  );

};
