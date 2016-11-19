'use strict';
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var should = require('should');
var session = require('supertest-session');
var uuid = require('uuid');
var User = require('../models/user');
var csrfTestUtils = require('./csrfTestUtils');

describe('AuthController', function() {
  var targetUser;
  var server;
  var testSession;
  var csrfToken;

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

  after(function (done) {
    server.close();
    done();
  });

  it('Log in success', function (done) {
    testSession.get('/')
      .expect(200)
      .end(function(err, res) {
        csrfToken = csrfTestUtils.getCsrf(res);
        testSession.post('/api/auth/login')
          .send({email: targetUser.email, password: targetUser.password, _csrf: csrfToken})
          .expect(http.MOVED_TEMPORARILY, done);
      });
  });

  it('Change password - old password mismatch', function(done) {
    testSession.post('/api/auth/password')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({old: 'wrong-pwd', new: 'new-pwd'})
      .expect(http.BAD_REQUEST, done);
  });

  it('Change password - success', function(done) {
    testSession.post('/api/auth/password')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({old: 'qwerasdf', new: 'new-pwd'})
      .expect(http.NO_CONTENT, done);
  });
});
