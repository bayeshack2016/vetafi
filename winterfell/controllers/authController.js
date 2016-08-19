var _ = require('lodash');
var passport = require('passport');
var requestify = require('requestify');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
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
      res.sendFile('signup.html', {root: './webapp/build/templates/noangular'});
    }
  });

  // Endpoint for routing login
  app.get('/login', function(req, res) {
    console.log('[login] request received for ' + JSON.stringify(req.body));
    console.log('[login] session for ' + JSON.stringify(req.session));
    if (req.session.key) {
      res.redirect('/');
    } else {
      res.sendFile('login.html', {root: './webapp/build/templates/noangular'});
    }
  });

  // Endpoint to authenticate sign-ups and begin session
  app.post('/auth/signup', function(req, res) {
    console.log('[authSignUp] request received for ' + JSON.stringify(req.body));
    var data = {
      email: req.body.email,
      password: req.body.password
    };

    // First find a user with this email
    User.findOne({email: data.email, state: User.State.ACTIVE}, function (err, user) {
      if (_.isEmpty(user)) { // User does not exist, create a new one!
        UserService.createNewUser(data, function(err, user) {
          if (user) {
            console.log('[authSignUp] Successfully created user ' + user.externalId);
            var extUserId = user.externalId;
            res.status(http.OK).send({userId: extUserId, redirect: '/'});
          } else {
            console.log('[authSignUp] ' + error.code + ' Error creating user: ' + error.msg);
            res.status(error.code).send({error: error.msg});
          }
        });
      } else { // User does exist!
          res.status(http.BAD_REQUEST).send({error: httpErrors.USER_EXISTS});
      }
    });
  });

  // Endpoint to authenticate logins and begin session
  app.post('/auth/login', passport.authenticate('local'), function(req, res) {
    console.log('[authLogIn] request received for ' + JSON.stringify(req.body));
    if (req.user) {
      req.session.key = req.body.email;
      var extUserId = req.user.externalId;
      res.status(http.OK).send({userId: extUserId, redirect: '/'});
    } else {
      res.status(http.UNAUTHORIZED);
    }
  });

  // Endpoint to logout and remove session
  app.get('/auth/logout', function(req, res) {
    console.log('[authLogOut] log out for ' + JSON.stringify(req.session));
    req.session.destroy(function (err) {
        if(err) {
            console.log(err);
            res.status(http.INTERNAL_SERVER_ERROR);
        } else {
            res.redirect('/');
        }
    });
  });

  // Endpoint for routing idme authorization
  // https://api.id.me/oauth/authorize?...
  app.get('/auth/link/idme', function(req, res) {
    console.log('[authLinkIdMe] link request with ' + JSON.stringify(req.params));
    var code = req.params.code;
    if (code) {
      requestify.post('https://api.id.me/oauth/token', {
        code: code,
        client_id: '71ffbd3f04241a56e63fa6a960fbb15e',
        client_secret: 'some_secret_client_id',
        redirect_uri: 'www.vetafi.org/',
        grant_type: 'authorization_code'
      }).then(function(socialResp) {
        console.log('[authLinkIdMe] idme linked! ' + JSON.stringify(socialResp));
        res.sendStatus(http.OK);
      });
    } else {
      res.sendStatus(http.BAD_REQUEST);
    }
  });

};
