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
    User.find({externalId: req.params.extUserId}).exec(function(err, user) {
      if (user) {
        FileClaim.find({userId: user._id}).exec(function(err, claims) {
          var extClaims = _.map(claims, function(c) {
            return c.externalize();
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
    FileClaim.find({externalId: req.params.extClaimId}).exec(function(err, claim) {
      if (claim) {
        res.status(http.OK).send({claim: claim.externalize()});
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.CLAIM_NOT_FOUND});
      }
    });
  });

  app.post('/claims/create', function (req, res) {
    console.log('[createClaim] request received for ' + JSON.stringify(req.body));
    var extUserId = req.body.extUserId;
    var callbacks = {
      onSuccess: function(claim) {
        res.status(http.OK).send({claim: FileClaim.externalize(claim)});
      },
      onError: function(errCode, status) {
        res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.DATABASE});
      }
    }
    if (extUserId) {
      User.findOne({externalId: extUserId}).exec(function(err, user) {
        if (user) {
          FileClaimService.createNewClaim(user.id, callbacks);
        } else {
          res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
        }
      });
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_USER_ID});
    }
  });

  function handleClaimStateChange(extClaimId, claimState) {
    FileClaim.findOne({externalId: extClaimId}).exec(function(err, claim) {
      if (claim) {
        FileClaimService.setClaimState(claim.id, claimState, function() {
          res.status(http.NO_CONTENT);
        });
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.CLAIM_NOT_FOUND});
      }
    });
  }

  app.post('/claims/:extClaimId/submit', function(req, res) {
    var extClaimId = req.body.extClaimId;
    if (extClaimId) {
      handleClaimStateChange(extClaimId, FileClaim.State.SUBMITTED);
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_CLAIM_ID});
    }
  });

  app.delete('/claims/:extClaimId', function (req, res) {
    console.log('[deleteClaim] request received for ' + req.params.extClaimId);
    var extClaimId = req.body.extClaimId;
    if (extClaimId) {
      handleClaimStateChange(extClaimId, FileClaim.State.DISCARDED);
    } else {
      res.status(http.BAD_REQUEST).send({error: httpErrors.INVALID_CLAIM_ID});
    }
  });

};
