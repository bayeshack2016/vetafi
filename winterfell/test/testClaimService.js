var should = require('should');
var sinon = require('sinon');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('../models/claim');
var ClaimService = require('../services/claimService');
var User = require('../models/user');
var UserService = require('../services/userService');

describe('ClaimService', function() {

  before(function(done) {
    Claim.remove({}).then(function() {
      User.remove({}).then(function() {
        done();
      });
    });
  });

  after(function() {
  });

  function createNewUser() {
    return UserService.createNewUser({email: 'moose@test.com', password: 'qwerasdf'}).then(function() {
      return User.findOne({}).exec(function(err, user) {
        user.email.should.equal('moose@test.com');
        user.state.should.equal(User.State.ACTIVE);
        return user;
      });
    });
  }

  it('Create new INCOMPLETE Claim - already exists', function(done) {
    var callbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
    var mockedCallbacks = sinon.mock(callbacks);
    mockedCallbacks.expects('onSuccess').never();
    mockedCallbacks.expects('onError').once().withArgs(http.BAD_REQUEST, httpErrors.CLAIM_INCOMPLETE_EXISTS);

    createNewUser().then(function() {
      User.findOne({}).exec(function(err, user) {
        var existingClaim = new Claim({
          userId: user._id,
          state: Claim.State.INCOMPLETE
        });
        existingClaim.save(function(err, claim) {
          ClaimService.createNewClaim(user._id, callbacks).then(function() {
            mockedCallbacks.verify();
            done();
          });
        });
      });
    });
  });

  xit('Create new INCOMPLETE Claim - success', function(done) {
    var callbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
    var mockedCallbacks = sinon.mock(callbacks);
    mockedCallbacks.expects('onError').never();

    createNewUser().then(function() {
      User.findOne({}).exec(function(err, user) {
        ClaimService.createNewClaim(user._id, callbacks).then(function() {
          mockedCallbacks.verify();
          done();
        });
      });
    });
  });

  it('Set Claim state to COMPLETED', function(done) {
    done();
  });

  it('Set Claim state to DISCARDED', function(done) {
    done();
  });

});
