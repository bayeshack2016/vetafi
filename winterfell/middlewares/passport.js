var _ = require('lodash');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var AuthService = require('../services/authService');
var idMeSecret = require('../config/idMe');

module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

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
              return next(null, false, 'auth_mismatch'); // email does not match
            }

            if (AuthService.isPasswordCorrect(user.password, password)) {
              return next(null, user);
            } else {
              return next(null, false, 'auth_mismatch'); // password does not match
            }
        });
    }
    passport.use('idme', new OAuth2Strategy({
            authorizationURL: 'https://api.id.me/oauth/authorize',
            tokenURL: 'https://api.id.me/oauth/token',
            clientID: idMeSecret.clientID,
            clientSecret: idMeSecret.clientSecret,
            callbackURL: 'http://127.0.0.0/auth/provider/callback'
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(accessToken, refreshToken, profile, done);
            /*User.findOrCreate(..., function(err, user) {
                done(err, user);
            });*/
        }
    ));
};
