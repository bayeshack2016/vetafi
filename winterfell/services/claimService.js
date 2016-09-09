var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('./../models/claim');

function ClaimService(app) {
  this.app = app;
}

module.exports = ClaimService;
module.exports.findIncompleteClaimOrCreate = function(userId, callback) {
  return Claim.findOne({ userId: userId, state: Claim.State.INCOMPLETE }).exec(function(err, fileClaim) {
    if (err) {
      callback(err, null);
    } else if (_.isEmpty(fileClaim)) {
      Claim.quickCreate(userId, callback);
    } else {
      callback(null, fileClaim)
    }
  });
};

module.exports.addForm = function(claimId, file, callbacks) {
  console.log('[addFileToClaim] not implemented');
};

module.exports.removeForm = function(claimId, file, callbacks) {
  console.log('[removeFormFromClaim] not implemented');
};

module.exports.setClaimState = function(claimId, state, callback) {
  var query = { _id: claimId };
  var update = { state: state };
  return Claim.update(query, update, callback);
};
