var _ = require('lodash');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('./../models/claim');
var Form = require('./../models/form');
var Q = require('q');
var bulk = require('bulk-require');
var formlyFields = bulk(__dirname + '/../forms/', ['*']);
var expressions = require("angular-expressions");

function ClaimService(app) {
  this.app = app;
}

module.exports = ClaimService;

/**
 * For a given form and set of responses, calculate how many questions
 * were answered (which is simply the number of keys in the responses),
 * and more complicatedly: how many questions on the form were answerable,
 * which requires evaluating the angular hideExpression attribute for
 * each field against the current responses.
 *
 * @param formName
 * @param data
 * @returns {{answerable: number, answered: number}}
 */
function calculateProgress(formName, data) {
  var evaluate, i;
  var template = formlyFields[formName];
  var output = {answerable: 0, answered: _.size(data)};

  if (!template) {
    return output;
  }

  for (i = 0; i < template.fields.length; i++) {
    var field = template.fields[i];
    if (field.hasOwnProperty('hideExpression')) {
      evaluate = expressions.compile(field.hideExpression);
      if (!evaluate({model: data})) {
        output.answerable += 1;
      }
    } else {
      output.answerable += 1;
    }
  }

  return output;
}

module.exports.calculateProgress = calculateProgress;

module.exports.findIncompleteClaimOrCreate = function(userId, forms, callback) {
  return Claim.findOne({ userId: userId, state: Claim.State.INCOMPLETE }).exec(function(err, fileClaim) {
    if (err) {
      callback(err, null);
    } else if (_.isEmpty(fileClaim)) {
      Claim.quickCreate(userId, function (err, claim) {
        if (err) {
          callback(err, null);
          return;
        }
        // Create all the forms and don't call the callback
        // until this is done by using a promise chain.
        var promise = Q();
        forms.forEach(function(form) {
          console.log("Creating form " + form);
          var progress = calculateProgress(form, {});
          promise = promise.then(function() {
            return Form.create({
              key: form,
              user: userId,
              responses: {},
              claim: claim._id,
              answered: progress.answered,
              answerable: progress.answerable
            });
          })
        });
        promise.then(function() {
          callback(null, claim);
        });
        promise.catch(function() {
          callback(err, null);
        });
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
