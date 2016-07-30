var lodash = require('lodash');
var FileClaim = require('./../models/fileClaim');

function FileClaimService(app) {
    this.app = app;
};

module.exports = FileClaimService;
module.exports.createNewClaim = function(userId, callbacks) {
  // find if claim with state INCOMPLETE exists.
  // if it does, return error.
  // if does not exist, create new file claim
  FileClaim.find().byUserAndState(userId, FileClaim.State.INCOMPLETE).exec(function(err, fileClaim) {
    if (err == null && fileClaim == null) {
      FileClaim.quickCreate(userId).then(function(claim, error) {
        if (lodash.isEmpty(callbacks)) {
          return;
        } else if (claim) {
          callbacks.onSuccess(claim);
        } else {
          callbacks.onError(500, 'database_error');
        }
      });
    } else if (err) {
      console.log('Error: ' + err);
    } else if (fileClaim) {
      console.log('Incomplete File Claim already exists');
    }
  })
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
  FileClaim.update(query, update, callback);
};
