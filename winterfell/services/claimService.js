var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('./../models/claim');

function ClaimService(app) {
    this.app = app;
};

module.exports = ClaimService;
module.exports.createNewClaim = function(userId, callbacks) {
  Claim.find({}).exec(function(err, claims) {
    console.log('claimsAll: ' + JSON.stringify(claims));
  });
  return Claim.findOne({ userId: userId, state: Claim.State.INCOMPLETE }).exec(function(err, claim) {
    console.log('claims: ' + JSON.stringify(claim));
    if (_.isEmpty(claim)) {
      return Claim.quickCreate(userId).then(function(claim, error) {
        if (claim) {
          _.isEmpty(callbacks) ? null : callbacks.onSuccess(claim);
          return claim;
        } else {
          _.isEmpty(callbacks) ? null : callbacks.onError(http.INTERNAL_SERVER_ERROR, httpErrors.DATABASE);
          return null;
        }
      });
    } else {
      _.isEmpty(callbacks) ? null : callbacks.onError(http.BAD_REQUEST, httpErrors.CLAIM_INCOMPLETE_EXISTS);
    }
    return null;
  });
};

module.exports.addFileToClaim = function(claimId, file, callbacks) {
  console.log('[addFileToClaim] not implemented');
};

module.exports.removeFileFromClaim = function(claimId, file, callbacks) {
  console.log('[removeFileFromClaim] not implemented');
};

module.exports.setClaimState = function(claimId, state, callback) {
  var query = { id: claimId };
  var update = { state: state };
  return Claim.update(query, update, callback);
};
