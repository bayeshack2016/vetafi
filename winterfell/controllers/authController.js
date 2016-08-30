var _ = require('lodash');
var passport = require('passport');
var request = require('request');
var constants = require('./../utils/constants');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var User = require('./../models/user');
var UserValues = require('./../models/userValues');
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
          if (err) {
            res.sendStatus(http.INTERNAL_SERVER_ERROR);
            return;
          }
          console.log('[authSignUp] Successfully created user ' + user.externalId);
          var extUserId = user.externalId;
          UserValues.create(
            {},
            function (error, userValues) {
              if (error) {
                res.sendStatus(http.INTERNAL_SERVER_ERROR);
                return
              }
              res.status(http.OK).send({userId: extUserId, redirect: '/'});
            }
          );
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
      req.session.userId = req.user._id;
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

  // Server endpoint for redirecting from ID.me authorization
  // https://api.id.me/oauth/authorize?...
  app.get('/auth/link/idme', function(req, res) {
    var prodEnv = app.environment == constants.environment.PROD;
    var baseUri = prodEnv ? 'https://www.vetafi.org' : 'http://localhost:3999';
    var clientId = prodEnv ? '71ffbd3f04241a56e63fa6a960fbb15e' : '684c7204feed7758b25527eae2d66e28';
    var secretClientId = prodEnv ? 'some-secret' : '57ebec28ad4bae403d0a2702f2f81801';

    console.log('[authLinkIdMe] link request with ' + JSON.stringify(req.query));
    var code = req.query.code;
    if (code) {
      var data = {
        code: code,
        client_id: clientId,
        client_secret: secretClientId,
        redirect_uri: baseUri + '/auth/link/idme',
        grant_type: 'authorization_code'
      };
      console.log('[authLinkIdMe] request token with data: ' + JSON.stringify(data));
      request.post({
        url: 'https://api.id.me/oauth/token',
        json: true,
        body: data
      }, function(error, response, body) {
        var accessToken = body.access_token; // provided by ID.me
        if (accessToken) {
          request.get('https://api.id.me/api/public/v2/attributes.json?access_token=' + accessToken, function(accessError, accessResponse, accessBody) {
            var idmeBody = JSON.parse(accessBody);
            if (!idmeBody.id) { // if id is not available, we messed up
              res.status(http.BAD_REQUEST).send({error: httpErrors.BAD_SOCIAL_AUTH});
              return;
            }
            handleSocialResponse(SocialUser.Type.ID_ME, accessToken, idmeBody.email, idmeBody);
          });
        } else { // no access token from ID.me
          res.status(http.BAD_REQUEST).send({error: httpErrors.BAD_SOCIAL_AUTH});
        }
      });
    } else { // no access code from ID.me
      res.status(http.BAD_REQUEST).send({error: httpErrors.BAD_SOCIAL_AUTH});
    }
  });

 /**
  * Helper method to handle any social logic.
  * This method requires a type (ID.Me, Facebook, etc.), a token from that social,
  * an email, and the response body to fill in user information
  */
  function handleSocialResponse(socialType, socialToken, socialEmail, socialBody) {
    // find user with ACTIVE socialUser with (type, token)
    UserService.findUserWithSocial(socialType, socialToken, function(err, user) {
      if (err) {
        res.sendStatus(http.INTERNAL_SERVER_ERROR);
      } else if (user) {
        res.status(http.BAD_REQUEST).send({error: httpErrors.SOCIAL_ALREADY_USED});
      } else {
        // find a user with matching email from social
        User.findOne({email: socialEmail}, function(err, user) {
          var responseCallback = function(err) {
            if (err) {
              res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.DATABASE});
            } else {
              res.status(http.OK).redirect('/');
            }
          };

          if (err) {
            res.sendStatus(http.INTERNAL_SERVER_ERROR);
          } else if (user) {
            // Add social to user
            user.socialUsers.push({type: socialType, oauthToken: socialToken, state: SocialUser.State.ACTIVE});
            user.save(responseCallback);
          } else {
            // Create new user and UserValues, then add social to user
            var callback = function(err, user) {
              UserValues.create({}, function() {
                UserService.pushSocialUser(user._id, socialType, socialToken, responseCallback);
              });
            };

            if (socialType == SocialUser.Type.ID_ME) {
              UserService.createNewUserFromIdMe(idmeBody, callback);
            } else {
              console.log('[authHandleSocial] unrecognized social type');
              res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.UNKNOWN});
            }
          }
        });
      }
    });
  }

};
