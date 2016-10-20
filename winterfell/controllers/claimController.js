var _ = require('lodash');
var auth = require('../middlewares/auth');
var Claim = require('../models/claim');
var ClaimService = require('./../services/claimService');
var Form = require('../models/form');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var mongoose = require('mongoose');
var User = require('../models/user');
var UserValues = require('../models/userValues');

module.exports = function (app) {
  var mw = [auth.authenticatedOr404];

  // Get all claims for a user
  app.get('/api/claims', mw, function (req, res) {
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
  app.get('/api/claim/:extClaimId', mw, function (req, res) {
    Claim.findOne({externalId: req.params.extClaimId}).exec(function(err, claim) {
      if (claim) {
        res.status(http.OK).send({claim: claim});
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.CLAIM_NOT_FOUND});
      }
    });
  });

  app.post('/api/claims/create', mw, function (req, res) {
    var callback = function (err, claim) {
      if (claim) {
        res.status(http.CREATED).send({claim: claim});
      } else {
        res.status(http.INTERNAL_SERVER_ERROR).send({error: httpErrors.DATABASE});
      }
    };

    User.findById(req.session.userId).exec(function (userErr, user) {
      if (user) {
        ClaimService.findIncompleteClaimOrCreate(user._id,
          (req.body.forms || []),
          callback);
      } else {
        res.status(http.NOT_FOUND).send({error: httpErrors.USER_NOT_FOUND});
      }
    });
  });

  function handleClaimStateChange(extClaimId, claimState, callback) {
    Claim.findOne({externalId: extClaimId}, function(err, claim) {
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

  app.post('/api/claim/:extClaimId/submit', mw, function (req, res) {
    handleClaimStateChange(req.params.extClaimId,
      Claim.State.SUBMITTED,
      claimUpdateCallbackFactory(res));
  });

  app.delete('/api/claim/:extClaimId', mw, function (req, res) {
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

  app.post('/api/save/:claim/:form', mw, function (req, res) {
    var progress = ClaimService.calculateProgress(req.params.form, req.body);
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
        claim: req.params.claim,
        answered: progress.answered,
        answerable: progress.answerable
      },
      {
        upsert: true,
        'new': true
      },
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
  });

  app.get('/api/claim/:claim/form/:form', mw, function (req, res) {
    Claim.findOne({externalId: req.params.claim}, function(error, claim) {
      if (error) {
        console.log(error);
        res.sendStatus(http.INTERNAL_SERVER_ERROR);
        return;
      }

      Form.findOne({
          key: req.params.form,
          user: req.session.userId,
          claim: claim._id
        },
        function (error, form) {
          res.status(http.OK).send({form: form});
        }
      );
    });
  });

  app.get('/api/claim/:claim/forms', mw, function (req, res) {
    Claim.findOne({externalId: req.params.claim}, function(error, claim) {
      if (error) {
        console.log(error);
        res.sendStatus(http.INTERNAL_SERVER_ERROR);
        return;
      }

      Form.find({
          user: req.session.userId,
          claim: claim._id
        },
        function (error, forms) {
          if (error) {
            console.log(error);
            res.sendStatus(http.INTERNAL_SERVER_ERROR);
            return;
          }
          res.status(http.OK).send(forms);
        }
      );
    });
  });
};
