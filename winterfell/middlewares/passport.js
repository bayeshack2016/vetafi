var _ = require('lodash');
var http = require('http-status-codes');
var request = require('request');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var httpErrors = require('./../utils/httpErrors');
var Constants = require('./../utils/constants');
var User = require('../models/user');
var SocialUser = require('../utils/socialUser');
var AuthService = require('../services/authService');

module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    var idmeClientId = app.get(Constants.KEY_IDME_CLIENT_ID);
    var idmeSecretId = app.get(Constants.KEY_IDME_SECRET_ID);

    passport.use('local', new LocalStrategy(
      { usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
      }, localStrategyHandler)
    );

    // takes in a user id to save to session
    passport.serializeUser(function (user, done) {
      done(null, user.get('id'));
    });

    // attaches the user object to a request (req)
    passport.deserializeUser(function (id, done) {
        app.models.User.findById(id, done);
    });

    function localStrategyHandler (req, email, password, next) {
      console.log('evaluating email ' + email);
      console.log('evaluating password ' + password);
        var normalizedEmail = _.isString(email) ? email.toLowerCase() : email;

        User.findOne({ email: normalizedEmail, state: User.State.ACTIVE }, function (err, user) {
            if (err) {
              return next(err);
            }

            if (!user) {
              return next(null, false, httpErrors.AUTH_MISMATCH); // email does not match
            }

            if (AuthService.isPasswordCorrect(user.password, password)) {
              return next(null, user);
            } else {
              return next(null, false, httpErrors.AUTH_MISMATCH); // password does not match
            }
        });
    }

    passport.use('idme', new OAuth2Strategy({
        authorizationURL: 'https://api.id.me/oauth/authorize',
        tokenURL: 'https://api.id.me/oauth/token',
        clientID: idmeClientId,
        clientSecret: idmeSecretId,
        callbackURL: '/auth/idme/callback'
      },
      function(accessToken, refreshToken, profile, done) {
        request.get('https://api.id.me/api/public/v2/attributes.json?access_token=' + accessToken, function(accessError, accessResponse, accessBody) {
          var idmeBody = JSON.parse(accessBody);
          if (!idmeBody.id) { // if id is not available, we messed up
            res.status(http.BAD_REQUEST).send({error: httpErrors.BAD_SOCIAL_AUTH});
            return;
          }
          AuthService.handleSocial(SocialUser.Type.ID_ME, accessToken, idmeBody.email, idmeBody, function(err, user) {
            done(err, user);
          });
        });
      }
    ));
};
