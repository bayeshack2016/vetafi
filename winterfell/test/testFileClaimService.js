var should = require('should');
var sinon = require('sinon');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var FileClaim = require('../models/fileClaim');
var FileClaimService = require('../services/fileClaimService');
var User = require('../models/user');
var UserService = require('../services/userService');

describe('FileClaimService', function() {
  var targetUser = undefined;

  before(function(done) {
     // Remove all users and create one user
     User.remove({}, function() {
       var user = {
         firstname: 'User1',
         lastname: 'McUser',
         email: 'user1@email.com',
         password: 'testword',
         state: User.State.ACTIVE
       };
       User.create(user, function(err, user) {
         targetUser = user;
         done();
       });
     });
   });

  beforeEach(function(done) {
    // Clear all FileClaims
    FileClaim.remove({}).then(function() {
      done();
    });
  });

  after(function() {
  });

  it('Create new INCOMPLETE FileClaim - already exists', function(done) {
    var existingFileClaim = new FileClaim({
      userId: targetUser._id,
      state: FileClaim.State.INCOMPLETE
    });
    existingFileClaim.save(function(err, claim) {
      FileClaimService.createNewClaim(targetUser._id, function(err, claim) {
        Boolean(err).should.equal(false);
        Boolean(claim).should.equal(false);
        done();
      });
    });
  });

  it('Create new INCOMPLETE FileClaim - success', function(done) {
    FileClaimService.createNewClaim(targetUser._id, function(err, claim) {
      Boolean(err).should.equal(false);
      claim.userId.should.equal(targetUser._id);
      claim.state.should.equal(FileClaim.State.INCOMPLETE);
      done();
    });
  });

  it('Set FileClaim state to COMPLETED', function(done) {
    FileClaimService.createNewClaim(targetUser._id, function(err, claim) {
      FileClaimService.setClaimState(claim._id, FileClaim.State.SUBMITTED, function(err, update) {
        Boolean(err).should.equal(false);
        update.ok.should.equal(1);
        FileClaim.findOne({_id: claim._id}, function(err, updatedClaim) {
          updatedClaim.state.should.equal(FileClaim.State.SUBMITTED);
          done();
        });
      });
    });
  });

  it('Set FileClaim state to DISCARDED', function(done) {
    FileClaimService.createNewClaim(targetUser._id, function(err, claim) {
      FileClaimService.setClaimState(claim._id, FileClaim.State.DISCARDED, function(err, update) {
        Boolean(err).should.equal(false);
        update.ok.should.equal(1);
        FileClaim.findOne({_id: claim._id}, function(err, claim) {
          claim.state.should.equal(FileClaim.State.DISCARDED);
          done();
        });
      });
    });
  });

  xit('Add form to claim', function(done) {

  });

  xit('Remove form from claim', function(done) {

  });

  xit('Get forms for claim', function(done) {

  });

});
