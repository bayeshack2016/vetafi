var _ = require('lodash');
var http = require('./../utils/httpResponses');
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
          _.isEmpty(callbacks) ? null : callbacks.onError(http.CODE_INTERNAL_SERVER_ERROR, http.ERROR_DATABASE);
          return null;
        }
      });
    } else {
      _.isEmpty(callbacks) ? null : callbacks.onError(http.CODE_BAD_REQUEST, http.ERROR_CLAIM_INCOMPLETE_EXISTS);
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
