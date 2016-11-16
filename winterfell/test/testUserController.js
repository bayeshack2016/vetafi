'use strict';
var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var User = require('../models/user');
var session = require('supertest-session');
var uuid = require('uuid');
var csrfTestUtils = require('./csrfTestUtils');

describe('UserController', function() {
  var targetUser;
  var server;
  var testSession;

  before(function () {
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
      });
    });
  });

  after(function () {
      server.close();
  });

  it('Get user endpoint - 404 if not authed', function(done) {
    testSession
        .get('/api/user')
        .expect(http.NOT_FOUND, done);
  });

  it('Delete user endpoint - 404 if not authed', function(done) {
    testSession
      .del('/api/user')
      .expect(http.FORBIDDEN, done);
  });

  it('should sign in', function (done) {
    testSession.get('/')
      .expect(200)
      .end(function(err, res) {
        var csrfToken = csrfTestUtils.getCsrf(res);
        testSession.post('/api/auth/login')
          .send({email: targetUser.email, password: targetUser.password, _csrf: csrfToken})
          .expect(http.MOVED_TEMPORARILY, done);
      });
  });

  it('Get user endpoint - success', function (done) {
    testSession
      .get('/api/user')
      .expect(http.OK, done);
  });

  it('Delete user endpoint - success', function (done) {
    testSession.get('/')
      .expect(200)
      .end(function(err, res) {
        var csrfToken = csrfTestUtils.getCsrf(res);
        testSession
          .del('/api/user')
          .set('X-XSRF-TOKEN', csrfToken)
          .expect(http.OK, done);
      });
  });

  xit('Modify user endpoint', function(done) {
  });
});
