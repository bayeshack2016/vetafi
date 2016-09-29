var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('./../models/claim');
var Form = require('./../models/form');
var Q = require('q');
var mongoose = require('mongoose');
mongoose.Promise = Q.Promise;

function ClaimService(app) {
  this.app = app;
}

module.exports = ClaimService;
module.exports.findIncompleteClaimOrCreate = function(userId, forms, callback) {
  return Claim.findOne({ userId: userId, state: Claim.State.INCOMPLETE }).exec(function(err, fileClaim) {
    if (err) {
      callback(err, null);
    } else if (_.isEmpty(fileClaim)) {
      Claim.quickCreate(userId, function (err, claim) {
        var promise = Q();
        forms.forEach(function(form) {
          promise.then(function() {
            return Form.create({
              key: form,
              user: userId,
              responses: {},
              claim: claim._id
            });
          })
        });
        promise.then(function() {
          callback(null, claim);
        });
        promise.catch(function() {
          callback(err, null);
        })
      })
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
