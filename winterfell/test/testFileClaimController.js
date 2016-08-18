'use strict';
var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var FileClaim = require('../models/fileClaim');
var Form = require('./../models/form');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('./../services/userService');
var session = require('supertest-session');
var uuid = require('uuid');


describe('FileClaimController', function() {
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
    FileClaim.remove({}, function() {
      done();
    });
  });

  after(function() {
      server.close();
  });

  it('Create claim for user - no external user id', function(done) {
    testSession
      .post('/claims/create')
      .expect(http.BAD_REQUEST, done);
  });

  it('Create claim for user - user dne', function(done) {
    testSession
      .post('/claims/create')
      .send({ extUserId: 'asdf' })
      .expect(http.NOT_FOUND, done);
  });

  it('Create claim for user - success', function(done) {
    testSession
      .post('/claims/create')
      .send({ extUserId: targetUser.externalId })
      .expect(http.OK, done);
  });

  it('Get claim - claim dne', function(done) {
    testSession
      .post('/claims/create')
      .send({ extUserId: targetUser.externalId })
      .expect(http.OK, function() {
        testSession
          .get('/claims/qwer')
          .expect(http.NOT_FOUND, done);
      });
  });

  it('Get claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: FileClaim.State.INCOMPLETE
    };
    FileClaim.create(claim, function() {
      testSession
        .get('/claims/' + claim.externalId)
        .expect(http.OK, done);
    });
  });

  it('Get claims for user - user dne', function(done) {
    testSession
        .get('/claims/user/qwer')
        .expect(http.NOT_FOUND, done);
  });

  it('Get claims for user - no claims', function(done) {
    testSession
        .get('/claims/user/' + targetUser.externalId)
        .expect(http.OK, done);
  });

  it('Get claims for user - success', function(done) {
    var claimsArr = [
      {
        userId: targetUser._id,
        externalId: uuid.v4(),
        state: FileClaim.State.INCOMPLETE
      },
      {
        userId: targetUser._id,
        externalId: uuid.v4(),
        state: FileClaim.State.INCOMPLETE
      }
    ];
    FileClaim.create(claimsArr, function() {
      testSession
        .get('/claims/' + claimsArr[0].externalId)
        .expect(http.OK, function() {
          testSession
            .get('/claims/' + claimsArr[1].externalId)
            .expect(http.OK, done);
        });
    });
  });

  it('Submit claim - claim dne', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: FileClaim.State.INCOMPLETE
    };
    FileClaim.create(claim, function() {
      testSession
        .post('/claims/qwer/submit')
        .expect(http.NOT_FOUND, done);
    });
  });

  it('Submit claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: FileClaim.State.INCOMPLETE
    };
    FileClaim.create(claim, function() {
      testSession
        .post('/claims/' + claim.externalId + '/submit')
        .expect(http.OK, done);
    });
  });

  it('Delete claim - claim dne', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: FileClaim.State.INCOMPLETE
    };
    FileClaim.create(claim, function() {
      testSession
        .del('/claims/qwer/submit')
        .expect(http.NOT_FOUND, done);
    });
  });

  xit('Delete claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      externalId: uuid.v4(),
      state: FileClaim.State.INCOMPLETE
    };
    FileClaim.create(claim, function() {
      testSession
        .del('/claims/' + claim.externalId)
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
        console.log(targetUser);
        UserValues.remove({}, function () {
          UserValues.create(
            {userId: targetUser._id},
            function (err, userValues) {
              console.log(userValues);
              FileClaim.create({user: targetUser._id}, function(err, claim) {
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
          doc.responses.should.deepEqual({key1: 'value1', key2: 'value2'});
          done();
        })
      });
  });
});