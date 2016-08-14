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
    }
    if (_.isFunction(callback)) {
      callback();
    }
    return null;
  });
};

module.exports.addForm = function(fileClaimId, file, callbacks) {
  console.log('[addFileToClaim] not implemented');
};

module.exports.removeForm = function(fileClaimId, file, callbacks) {
  console.log('[removeFormFromClaim] not implemented');
};

module.exports.setClaimState = function(fileClaimId, state, callback) {
  var query = { _id: fileClaimId };
  var update = { state: state };
  return FileClaim.update(query, update, callback);
};
