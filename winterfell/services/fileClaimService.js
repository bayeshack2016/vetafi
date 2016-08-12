var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var FileClaim = require('./../models/fileClaim');

function FileClaimService(app) {
    this.app = app;
};

module.exports = FileClaimService;
module.exports.createNewClaim = function(userId, callback) {
  return FileClaim.findOne({ userId: userId, state: FileClaim.State.INCOMPLETE }).exec(function(err, fileClaim) {
    if (_.isEmpty(fileClaim)) {
      return FileClaim.quickCreate(userId, callback);
    } else if (_.isFunction(callback)) {
      callback({code: http.BAD_REQUEST, msg: httpErrors.CLAIM_INCOMPLETE_EXISTS});
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
