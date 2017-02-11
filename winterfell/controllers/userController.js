var auth = require('../middlewares/auth');
var express = require('express');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var mongoose = require('mongoose');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('./../services/userService');

var router = express.Router();

var mw = [auth.authenticatedOr404];

// Get a user's information based on externalId
router.get('/api/user', mw, function (req, res) {
  User.findById(req.session.userId).exec(function (err, user) {
    if (user) {
      res.status(http.OK).send({user: User.externalize(user)});
    } else {
      res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
    }
  });
});

// Modify a user's information - find by externalId
// Can edit the following:
// firstname, middlename, lastname, email
// contact.address, contact.phoneNumber
router.post('/api/user/', mw, function (req, res) {
  var body = req.body || {};
  var contact = body.contact || {};
  var address = contact.address || {};

  var updateUserInfo = {
    firstname: body.firstname || '',
    middlename: body.middlename || '',
    lastname: body.lastname || '',
    email: body.email || '',
    contact: {
      phoneNumber: contact.phoneNumber || '',
      address: {
        name: address.name || '',
        street1: address.street1 || '',
        street2: address.street2 || '',
        city: address.city || '',
        province: address.province || '',
        country: address.country || '',
        postal: address.postal || ''
      }
    }
  };

  User.findById(req.session.userId).exec(function (err, user) {
    if (user) {
      UserService.editUser(user._id, updateUserInfo, function (err, user) {
        if (user) {
          res.status(http.OK).send({user: User.externalize(user)});
        } else {
          res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
        }
      });
    } else {
      res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
    }
  });
});

// Set a user account to INACTIVE - find by externalId
router.delete('/api/user', mw, function (req, res) {
  var callback = function (dbErr) {
    if (dbErr) {
      console.log('[deleteUser] Not found!');
      res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
    } else {
      console.log('[deleteUser] Successfully deleted');
      // Destroy session
      req.session.destroy(function (redisErr) {
        if (redisErr) {
          res.status(http.INTERNAL_SERVER_ERROR).send();
        } else {
          res.sendStatus(http.OK);
        }
      });
    }
  };
  User.findById(req.session.userId).exec(function (err, user) {
    if (user) {
      UserService.setUserState(user.id, User.State.INACTIVE, callback);
    } else {
      res.sendStatus(http.NOT_FOUND);
    }
  });
});

router.get('/api/user/values', mw, function (req, res) {
  User.findById(req.session.userId).exec(function (err, user) {
    if (err) {
      res.status(http.INTERNAL_SERVER_ERROR).send();
      return;
    }

    if (user) {
      var promise = UserValues.findOne({userId: user._id});

      promise.then(function success(userValues) {
        console.log("sending vals", userValues);
        res.status(http.OK).send({values: userValues || {}});
      });

      promise.catch(function failure() {
        res.status(http.INTERNAL_SERVER_ERROR).send();
      });
    } else {
      res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
    }
  });
});

router.post('/api/user/values', mw, function (req, res) {
  var valuesToUpdate = req.body.values;
  if (valuesToUpdate && valuesToUpdate.key && valuesToUpdate.value) {
    User.findById(req.session.userId).exec(function (err, user) {
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

module.exports = router;
