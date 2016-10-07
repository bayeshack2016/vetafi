var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('../models/claim');
var ClaimService = require('../services/claimService');
var User = require('../models/user');
var UserService = require('../services/userService');
var Form = require('../models/form');

describe('ClaimService', function() {
  var server, targetUser;

  before(function (done) {
    server = require('../app');

    // Remove all users and create one user
    User.remove({}, function () {
      var user = {
        firstname: 'User1',
        lastname: 'McUser',
        email: 'user1@email.com',
        password: 'testword',
        state: User.State.ACTIVE
      };
      User.create(user, function (err, user) {
        targetUser = user;
        done();
      });
    });
  });

  beforeEach(function(done) {
    Claim.remove({}, done);
  });

  it('Create new INCOMPLETE Claim - already exists', function(done) {
    var existingClaim = new Claim({
      userId: targetUser._id,
      state: Claim.State.INCOMPLETE
    });
    existingClaim.save(function(err, claim) {
      ClaimService.findIncompleteClaimOrCreate(targetUser._id, [], function(err, claim) {
        Boolean(err).should.equal(false);
        Boolean(claim).should.equal(true);
        done();
      });
    });
  });

  it('Create new INCOMPLETE Claim - success', function(done) {
    ClaimService.findIncompleteClaimOrCreate(targetUser._id, [], function(err, claim) {
      Boolean(err).should.equal(false);
      claim.userId.should.equal(targetUser._id);
      claim.state.should.equal(Claim.State.INCOMPLETE);
      done();
    });
  });

  it('Set Claim state to SUBMITTED', function(done) {
    ClaimService.findIncompleteClaimOrCreate(targetUser._id, [], function(err, claim) {
      ClaimService.setClaimState(claim._id, Claim.State.SUBMITTED, function(err, update) {
        Boolean(err).should.equal(false);
        update.ok.should.equal(1);
        Claim.findOne({_id: claim._id}, function(err, updatedClaim) {
          updatedClaim.state.should.equal(Claim.State.SUBMITTED);
          done();
        });
      });
    });
  });

  it('Set Claim state to DISCARDED', function(done) {
    ClaimService.findIncompleteClaimOrCreate(targetUser._id, [], function(err, claim) {
      ClaimService.setClaimState(claim._id, Claim.State.DISCARDED, function(err, update) {
        Boolean(err).should.equal(false);
        update.ok.should.equal(1);
        Claim.findOne({_id: claim._id}, function(err, claim) {
          claim.state.should.equal(Claim.State.DISCARDED);
          done();
        });
      });
    });
  });

  it('Create claim with forms', function (done) {
    ClaimService.findIncompleteClaimOrCreate(targetUser._id, ['VBA-21-0966-ARE'], function (err, claim) {
      Form.find({claim: claim._id}, function (err, forms) {
        Boolean(err).should.equal(false);
        forms.length.should.be.exactly(1);
        done();
      });
    });
  });

  xit('Remove form from claim', function(done) {

  });

  xit('Get forms for claim', function(done) {

  });

});
