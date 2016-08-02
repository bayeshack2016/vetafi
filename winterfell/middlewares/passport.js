var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var http = require('../utils/httpResponses');
var User = require('../models/user');
var AuthService = require('../services/authService');

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
              return next(null, false, http.ERROR_AUTH_MISMATCH); // email does not match
            }

            if (AuthService.isPasswordCorrect(user.password, password)) {
              return next(null, user);
            } else {
              return next(null, false, http.ERROR_AUTH_MISMATCH); // password does not match
            }
        });
    }
};
