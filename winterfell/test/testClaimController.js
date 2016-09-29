'use strict';
var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('../models/claim');
var Form = require('./../models/form');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('./../services/userService');
var session = require('supertest-session');
var uuid = require('uuid');
var claimController = require('./../controllers/claimController.js');

describe('ClaimController', function() {
  var targetUser;
  var server;
  var testSession;

  before(function(done) {
    server = require('../app');
    testSession = session(server);

    User.remove({}, function() {
      User.create({
        firstname: 'Sir',
        middlename: 'Moose',
        lastname: 'Alot',
        email: 'sirmoosealot@test.com',
        password: 'qwerasdf',
        externalId: uuid.v4(),
        state: User.State.ACTIVE
      }, function(err, user) {
        targetUser = user;
        done();
      });
    });
  });

  beforeEach(function(done) {
    Claim.remove({}, done);
  });

  it('Get claims for user - 404 if not authed', function(done) {
    testSession
      .get('/claims')
      .expect(http.NOT_FOUND, done);
  });

  it('should sign in', function (done) {
    testSession.post('/auth/login')
      .send({email: targetUser.email, password: targetUser.password})
      .expect(200, done);
  });

  it('Create claim for user - success', function(done) {
    testSession
      .post('/claims/create')
      .expect(http.CREATED, done);
  });

  it('Get claim - claim dne', function(done) {
    testSession
      .post('/claims/create')
      .expect(http.OK, function() {
        testSession
          .get('/claim/qwer')
          .expect(http.NOT_FOUND, done);
      });
  });

  it('Get claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim, function() {
      testSession
        .get('/claim/' + claim.externalId)
        .expect(http.OK, done);
    });
  });

  it('Get claims for user - success', function(done) {
    var claimsArr = [
      {
        userId: targetUser._id,
        externalId: uuid.v4(),
        state: Claim.State.INCOMPLETE
      },
      {
        userId: targetUser._id,
        externalId: uuid.v4(),
        state: Claim.State.INCOMPLETE
      }
    ];
    Claim.create(claimsArr, function() {
      testSession
        .get('/claim/' + claimsArr[0].externalId)
        .expect(http.OK, function() {
          testSession
            .get('/claim/' + claimsArr[1].externalId)
            .expect(http.OK, done);
        });
    });
  });

  it('Submit claim - claim dne', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim, function() {
      testSession
        .post('/claim/qwer/submit')
        .expect(http.NOT_FOUND, done);
    });
  });

  it('Submit claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim, function() {
      testSession
        .post('/claim/' + claim.externalId + '/submit')
        .expect(http.OK, done);
    });
  });

  it('Delete claim - claim dne', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim, function() {
      testSession
        .del('/claim/qwer')
        .expect(http.NOT_FOUND, done);
    });
  });

  it('Delete claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim, function() {
      testSession
        .del('/claim/' + claim.externalId)
        .expect(http.OK, done);
    });
  });
});

describe('SaveClaimController', function () {
  var testSession, server, targetUser, targetClaim;

  before(function (done) {
    this.timeout(20000);
    server = require('../app');
    testSession = session(server);

    // Remove all users and create one user with user values
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
        UserValues.remove({}, function () {
          UserValues.create(
            {userId: targetUser._id},
            function (err, userValues) {
              Claim.create({user: targetUser._id}, function(err, claim) {
                targetClaim = claim;
                done();
              });
            });
        });
      });
    });
  });

  it('should 404 before sign in', function (done) {
    testSession
      .post('/save/1/1')
      .expect(404, done);
  });

  it('should sign in', function (done) {
    testSession.post('/auth/login')
      .send({email: targetUser.email, password: targetUser.password})
      .expect(200, done);
  });


  it('Should save the claim form after signin', function(done) {
    testSession
      .post('/save/' + targetClaim._id + '/1')
      .send({key1: 'value1', key2: 'value2'})
      .expect(201, function() {
        Form.findOne({key: '1', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          doc.responses.should.deepEqual({key1: 'value1', key2: 'value2'});
          done();
        })
      });
  });

  it('Should correctly calculate progress after save', function(done) {
    testSession
      .post('/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .send({filing_for_self: false})
      .expect(201, function() {
        Form.findOne({key: 'VBA-21-0966-ARE', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          doc.answered.should.be.exactly(1);
          doc.answerable.should.be.exactly(27);
          done();
        })
      })
  });

  it('Should correctly calculate progress after save with hidden questions', function(done) {
    testSession
      .post('/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .send({filing_for_self: true})
      .expect(201, function() {
        Form.findOne({key: 'VBA-21-0966-ARE', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          doc.answered.should.be.exactly(1);
          doc.answerable.should.be.exactly(22);
          done();
        })
      })
  });
});
