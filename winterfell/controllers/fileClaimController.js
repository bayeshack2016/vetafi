var mongoose = require('mongoose');
var http = require('../utils/httpResponses');
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
          res.status(http.CODE_SUCCESS).send({claims: extClaims});
        });
      } else {
        res.status(http.CODE_NOT_FOUND).send({error: http.ERROR_USER_NOT_FOUND});
      }
    });
  });

  // Get a particular claim
  app.get('/claims/:extClaimId', function (req, res) {
    console.log('[getClaim] request received for ' + req.params.extClaimId);
    FileClaim.find({externalId: req.params.extClaimId}).exec(function(err, claim) {
      if (claim) {
        res.status(http.CODE_SUCCESS).send({claim: claim.externalize()});
      } else {
        res.status(http.CODE_NOT_FOUND).send({error: http.ERROR_CLAIM_NOT_FOUND});
      }
    });
  });

  app.post('/claims/create', function (req, res) {
    console.log('[createClaim] request received for ' + JSON.stringify(req.body));
    var extUserId = req.body.extUserId;
    var callbacks = {
      onSuccess: function(claim) {
        res.status(http.CODE_SUCCESS).send({claim: FileClaim.externalize(claim)});
      },
      onError: function(errCode, status) {
        res.status(http.CODE_INTERNAL_SERVER_ERROR).send({error: http.ERROR_DATABASE});
      }
    }
    if (extUserId) {
      User.findOne({externalId: extUserId}).exec(function(err, user) {
        if (user) {
          FileClaimService.createNewClaim(user.id, callbacks);
        } else {
          res.status(http.CODE_NOT_FOUND).send({error: http.ERROR_USER_NOT_FOUND});
        }
      });
    } else {
      res.status(http.CODE_BAD_REQUEST).send({error: http.ERROR_INVALID_USER_ID});
    }
  });

  app.delete('/claims/:extClaimId', function (req, res) {
    console.log('[deleteClaim] request received for ' + req.params.extClaimId);
    var extClaimId = req.body.extClaimId;
    FileClaim.findOne({externalId: extClaimId}).exec(function(err, claim) {
      if (claim) {
        FileClaimService.setClaimState(claim.id, FileClaim.State.DISCARDED, function() {
          res.status(http.CODE_SUCCESS);
        });
      } else {
        res.status(http.CODE_NOT_FOUND).send({error: http.ERROR_CLAIM_NOT_FOUND});
      }
    });
  });

};
