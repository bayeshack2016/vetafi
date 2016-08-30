var mongoose = require('mongoose');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('../models/claim');
var ClaimService = require('./../services/claimService');
var User = require('../models/user');
var Form = require('../models/form');
var UserValues = require('../models/userValues');
var auth = require('../middlewares/auth');
var _ = require('lodash');

module.exports = function (app) {

  // Get all claims for a user
  app.get('/claims', auth.authenticatedOr404, function (req, res) {
    console.log('[getClaimsForUser] request received for ' + req.session.userId);
    User.findById(req.session.userId).exec(function(err, user) {
      if (err) {
        res.sendStatus(http.INTERNAL_SERVER_ERROR);
        return;
      }
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
  app.get('/claim/:extClaimId', auth.authenticatedOr404, function (req, res) {
    console.log('[getClaim] request received for ' + req.params.extClaimId);
    Claim.findOne({externalId: req.params.extClaimId}).exec(function(err, claim) {
      if (claim) {
        res.status(http.OK).send({claim: claim});
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.CLAIM_NOT_FOUND});
      }
    });
  });

  app.post('/claims/create', auth.authenticatedOr404, function (req, res) {
    console.log('[createClaim] request received for ' + JSON.stringify(req.body));
    var callback = function (err, claim) {
      if (claim) {
        res.status(http.CREATED).send({claim: claim});
      } else {
        res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.DATABASE});
      }
    };

    User.findById(req.session.userId).exec(function (userErr, user) {
      if (user) {
        ClaimService.createNewClaim(user.id, callback);
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      }
    });
  });

  function handleClaimStateChange(extClaimId, claimState, callback) {
    Claim.findOne({externalId: extClaimId}).exec(function(err, claim) {
      if (err) {
        callback(err, null);
        return;
      }
      if (claim) {
        ClaimService.setClaimState(claim._id, claimState, callback);
      } else {
        callback(null, null);
      }
    });
  }

  function claimUpdateCallbackFactory(res) {
    return function (err, claim) {
      if (err) {
        res.sendStatus(http.INTERNAL_SERVER_ERROR);
        return;
      }

      if (claim) {
        res.sendStatus(http.OK);
      } else {
        res.sendStatus(http.NOT_FOUND);
      }
    }
  }

  app.post('/claim/:extClaimId/submit', function(req, res) {
    console.log('[submitClaim] request received ' + JSON.stringify(req.body));

    handleClaimStateChange(req.params.extClaimId,
      Claim.State.SUBMITTED,
      claimUpdateCallbackFactory(res));
  });

  app.delete('/claim/:extClaimId', function (req, res) {
    console.log('[deleteClaim] request received for ' + req.params.extClaimId);

    handleClaimStateChange(req.params.extClaimId,
      Claim.State.DISCARDED,
      claimUpdateCallbackFactory(res));
  });

  /**
   * Update UserValues document given the answers contained inside the form.
   */
  function updateUserValuesFromForm(form, cb) {
    UserValues.findOne({
        userId: form.user
      },
      function (error, currentUserValues) {
        if (error) {
          cb(error, null);
          return;
        }
        var newValues = _.merge(currentUserValues.values, form.responses);
        UserValues.update(
          {
            userId: form.user
          },
          {
            values: newValues
          },
          {},
          function (error, userValues) {
            if (error) {
              cb(error, null);
            } else {
              cb(null, userValues);
            }
          });
      }
    );
  }

  app.post('/save/:claim/:form', function (req, res) {
    if (req.session.key) {
      console.log("/save/:claim/:form authed");
      Form.findOneAndUpdate(
        {
          key: req.params.form,
          user: req.session.userId,
          claim: req.params.claim
        },
        {
          key: req.params.form,
          responses: req.body,
          user: req.session.userId,
          claim: req.params.claim
        },
        {upsert: true,
          "new": true},
        function (error, form) {
          if (error) {
            res.sendStatus(http.INTERNAL_SERVER_ERROR);
          } else {
            updateUserValuesFromForm(form,
              function (error, userValues) {
                if (error) {
                  res.sendStatus(http.INTERNAL_SERVER_ERROR);
                  return;
                }
                res.sendStatus(http.CREATED);
              }
            );
          }
        });
    } else {
      console.log("[/save/:claim:/:form] no credentials");
      console.log(req.session);
      res.sendStatus(http.NOT_FOUND);
    }
  });
};