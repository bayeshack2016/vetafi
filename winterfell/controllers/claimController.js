var _ = require('lodash');
var mongoose = require('mongoose');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('../models/claim');
var ClaimService = require('./../services/claimService');
var User = require('../models/user');

module.exports = function (app) {

  // Get all claims for a user
  app.get('/claims/user/:extUserId', function (req, res) {
    console.log('[getClaimsForUser] request received for ' + req.params.extUserId);
    User.findOne({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        Claim.find({userId: user._id}).exec(function(err, claims) {
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
    Claim.findOne({externalId: req.params.extClaimId}).exec(function(err, claim) {
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
        res.status(http.OK).send({claim: claim});
      } else {
        res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.DATABASE});
      }
    };

    if (extUserId) {
      User.findOne({externalId: extUserId}).exec(function(userErr, user) {
        if (user) {
          ClaimService.createNewClaim(user.id, callback);
        } else {
          res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
        }
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_USER_ID});
    }
  });

  function handleClaimStateChange(extClaimId, claimState, callback) {
    Claim.findOne({externalId: extClaimId}).exec(function(err, claim) {
      if (claim) {
        ClaimService.setClaimState(claim._id, claimState, callback);
      } else if (_.isFunction(callback)) {
        callback({code: http.NOT_FOUND, msg: httpErrors.CLAIM_NOT_FOUND});
      }
    });
  }

  app.post('/claims/:extClaimId/submit', function(req, res) {
    console.log('[submitClaim] request received ' + JSON.stringify(req.body));
    var extClaimId = req.params.extClaimId;
    if (extClaimId) {
      handleClaimStateChange(extClaimId, Claim.State.SUBMITTED, function(err, claim) {
        if (claim) {
          res.sendStatus(http.OK);
        } else if (err.code == http.NOT_FOUND) {
          res.status(http.NOT_FOUND).send({error: httpErrors.CLAIM_NOT_FOUND});
        } else {
          res.status(err.code).send({error: err.msg});
        }
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_CLAIM_ID});
    }
  });

  app.delete('/claims/:extClaimId', function (req, res) {
    console.log('[deleteClaim] request received for ' + req.params.extClaimId);
    var extClaimId = req.params.extClaimId;
    if (extClaimId) {
      var statusCode = handleClaimStateChange(extClaimId, Claim.State.DISCARDED);
      if (statusCode == http.NOT_FOUND) {
        res.status(statusCode).send({error: httpErrors.CLAIM_NOT_FOUND});
      } else {
        res.sendStatus(statusCode);
      }
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_CLAIM_ID});
    }
  });

};
