var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var FileClaim = require('../models/fileClaim');
var FileClaimService = require('../services/fileClaimService');
var User = require('../models/user');
var UserService = require('../services/userService');

describe('FileClaimService', function() {
  var targetUser;

  before(function(done) {
    User.remove({}, function() {
      User.create({
        firstname: 'Sir',
        middlename: 'Moose',
        lastname: 'Alot',
        email: 'moose@test.com',
        password: 'qwerasdf',
        state: User.State.ACTIVE
      }, function(err, user) {
        targetUser = user;
        done();
      });
    });
  });

  beforeEach(function(done) {
    FileClaim.remove({}, done);
  });

  it('Create new INCOMPLETE FileClaim - already exists', function(done) {
    var existingFileClaim = new FileClaim({
      userId: targetUser._id,
      state: FileClaim.State.INCOMPLETE
    });
    existingFileClaim.save(function(err, claim) {
      FileClaimService.createNewClaim(targetUser._id, function(err2) {
        err2.code.should.equal(http.BAD_REQUEST);
        err2.msg.should.equal(httpErrors.CLAIM_INCOMPLETE_EXISTS);
        done();
      });
    });
  });

  it('Create new INCOMPLETE FileClaim - success', function(done) {
    FileClaimService.createNewClaim(targetUser._id, function(claimErr, claim) {
      claim.userId.should.equal(targetUser._id);
      claim.state.should.equal(FileClaim.State.INCOMPLETE);
      done();
    });
  });

  it('Set FileClaim state to COMPLETED', function(done) {
    done();
  });

  it('Set FileClaim state to DISCARDED', function(done) {
    done();
  });

});
