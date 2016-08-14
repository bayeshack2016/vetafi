var _ = require('lodash');
var mongoose = require('mongoose');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var FileClaim = require('../models/fileClaim');
var FileClaimService = require('./../services/fileClaimService');
var User = require('../models/user');

module.exports = function (app) {

  // Get all claims for a user
  app.get('/claims/user/:extUserId', function (req, res) {
    console.log('[getClaimsForUser] request received for ' + req.params.extUserId);
    User.findOne({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        FileClaim.find({userId: user._id}).exec(function(err, claims) {
          var extClaims = _.map(claims, function(c) {
            return c;
          });
          res.status(http.OK).send({claims: extClaims});
        });
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      }
    });
  });

  // Get a particular claim
  app.get('/claims/:extClaimId', function (req, res) {
    console.log('[getClaim] request received for ' + req.params.extClaimId);
    FileClaim.findOne({externalId: req.params.extClaimId}).exec(function(err, claim) {
      if (claim) {
        res.status(http.OK).send({claim: claim});
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.CLAIM_NOT_FOUND});
      }
    });
  });

  app.post('/claims/create', function (req, res) {
    console.log('[createClaim] request received for ' + JSON.stringify(req.body));
    var extUserId = req.body.extUserId;
    var callback = function(err, claim) {
      if (claim) {
        res.status(http.OK).send({claim: FileClaim});
      } else {
        res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.DATABASE});
      }
    };

    if (extUserId) {
      User.findOne({externalId: extUserId}).exec(function(userErr, user) {
        if (user) {
          FileClaimService.createNewClaim(user.id, callback);
        } else {
          res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
        }
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_USER_ID});
    }
  });

  app.post('/claims/:extClaimId/submit', function(req, res) {
    console.log('[submitClaim] request received ' + JSON.stringify(req.body));
    var extClaimId = req.params.extClaimId;
    if (extClaimId) {
      handleClaimStateChange(extClaimId, FileClaim.State.SUBMITTED, function(code, msg) {
        res.status(code).send({error: httpErrors.CLAIM_NOT_FOUND});
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_CLAIM_ID});
    }
  });

  app.delete('/claims/:extClaimId', function (req, res) {
    console.log('[deleteClaim] request received for ' + req.params.extClaimId);
    var extClaimId = req.params.extClaimId;
    if (extClaimId) {
      handleClaimStateChange(extClaimId, FileClaim.State.DISCARDED, function(code, msg) {
        res.status(code).send({error: httpErrors.CLAIM_NOT_FOUND});
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_CLAIM_ID});
    }
  });

  function handleClaimStateChange(extClaimId, claimState, callback) {
    FileClaim.findOne({externalId: extClaimId}).exec(function(err, claim) {
      if (claim) {
        FileClaimService.setClaimState(claim._id, claimState, callback(http.OK));
      } else if (_.isFunction(callback)) {
        callback(http.NOT_FOUND, httpErrors.CLAIM_NOT_FOUND);
      }
    });
  }

};
