var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var FileClaim = require('./../models/fileClaim');

function FileClaimService(app) {
    this.app = app;
};

module.exports = FileClaimService;
module.exports.createNewClaim = function(userId, callbacks) {
  FileClaim.find({}).exec(function(err, claims) {
    console.log('claimsAll: ' + JSON.stringify(claims));
  });
  return FileClaim.findOne({ userId: userId, state: FileClaim.State.INCOMPLETE }).exec(function(err, fileClaim) {
    console.log('claims: ' + JSON.stringify(fileClaim));
    if (_.isEmpty(fileClaim)) {
      return FileClaim.quickCreate(userId).then(function(claim, error) {
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

module.exports.addFileToClaim = function(fileClaimId, file, callbacks) {
  console.log('[addFileToClaim] not implemented');
};

module.exports.removeFileFromClaim = function(fileClaimId, file, callbacks) {
  console.log('[removeFileFromClaim] not implemented');
};

module.exports.setClaimState = function(fileClaimId, state, callback) {
  var query = { id: fileClaimId };
  var update = { state: state };
  return FileClaim.update(query, update, callback);
};
