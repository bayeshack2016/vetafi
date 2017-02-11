var _ = require('lodash');
var authenticatedOr404 = require('../middlewares/authenticatedOr404');
var AuthUtil = require('../utils/authUtil');
var constants = require('./../utils/constants');
var express = require('express');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var passport = require('passport');
var User = require('./../models/user');
var UserValues = require('./../models/userValues');
var UserService = require('./../services/userService');

var router = express.Router();

// Endpoint for routing sign-up
router.get('/signup', function (req, res) {
  if (req.session.key) {
    res.redirect('/');
  } else {
    return res.render('signup',
      {
        csrf: req.csrfToken(),
        viewId: 'signup-view',
        idmeUrl: req.app.get('idmeUrl'),
        errorMessage: req.query.error ? constants.ERROR_CODES[req.query.error].message : undefined
      });
  }
});

// Endpoint for routing login
router.get('/login', function (req, res) {
  if (req.session.key) {
    res.redirect('/');
  } else {
    return res.render('login',
      {
        csrf: req.csrfToken(),
        viewId: 'login-view',
        idmeUrl: req.app.get('idmeUrl'),
        errorMessage: req.query.error ? constants.ERROR_CODES[req.query.error].message : undefined
      });
  }
});

// Endpoint to logout and remove session
router.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(http.INTERNAL_SERVER_ERROR);
    } else {
      res.redirect('/');
    }
  });
});

// Endpoint to authenticate sign-ups and begin session
router.post('/api/auth/signup', function (req, res) {
  var data = {
    email: req.body.email,
    password: req.body.password
  };

  // First find a user with this email
  User.findOne({email: data.email, state: User.State.ACTIVE}, function (err, user) {
    if (_.isEmpty(user)) { // User does not exist, create a new one!
      UserService.createNewUser(data, function (err, user) {
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
            req.login(user, function (err) {
              if (err) {
                return next(err);
              }
              req.session.key = req.body.email;
              req.session.userId = req.user._id;
              return res.redirect('/');
            });
          }
        );
      });
    } else { // User does exist!
      res.redirect('/signup?error=EUSERNAMETAKEN'); // TODO render client side
    }
  });
});

// Endpoint to authenticate logins and begin session
router.post('/api/auth/login',
  passport.authenticate('local', {
    failureRedirect: '/login?error=EAUTHFAILED'
  }),
  function (req, res) {
    if (req.user) {
      req.session.key = req.body.email;
      req.session.userId = req.user._id;
      res.redirect('/');
    }
  });

/*
 * OAuth Endpoints
 */

// Id.Me oauth endpoint
router.get('/api/auth/idme',
  passport.authenticate('idme', {scope: 'military'})
);

// Id.Me oauth callback endpoint
// If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
router.get('/api/auth/idme/callback',
  passport.authenticate('idme', {
      successRedirect: '/',
      failureRedirect: '/login?error=EAUTHFAILED'
    }
  ));


/*
 * Other Endpoints
 */
router.post('/api/auth/password', authenticatedOr404, function (req, res) {
  var oldPwd = req.body.old;
  User.findOneWithPassword({_id: req.session.userId}).exec(function (err, user) {
    if (err) {
      res.sendStatus(http.INTERNAL_SERVER_ERROR);
      return;
    }
    if (user) {
      if (AuthUtil.isPasswordCorrect(user.password, oldPwd)) {
        // save new password, and save a new salt
        var salt = AuthUtil.generatePasswordSalt();
        var hashedPwd = AuthUtil.generatePassword(req.body.new, salt);
        User.update(
          {_id: req.session.userId}, // query
          {password: hashedPwd, passwordSalt: hashedPwd}, // new password
          function () {
            res.sendStatus(http.NO_CONTENT);
          }
        );
      } else {
        res.status(http.BAD_REQUEST).send(httpErrors.AUTH_MISMATCH);
      }
    } else {
      res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
    }
  });
});


module.exports = router;
