'use strict';
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var session = require('supertest-session');
var should = require('should');
var User = require('../models/user');
var uuid = require('uuid');

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
      .expect(http.NOT_FOUND, done);
  });

  it('Should sign in', function (done) {
    testSession.post('/api/auth/login')
      .send({email: targetUser.email, password: targetUser.password})
      .expect(200, done);
  });

  it('Get user endpoint - success', function(done) {
    testSession
        .get('/api/user')
        .expect(http.OK, done);
  });

  it('Post user endpoint - success', function(done) {
    testSession
        .post('/api/user')
        .send({
          firstname: 'Mister',
          lastname: 'Moosey',
          email: 'sirmoosealot@test.com',
          contact: {
            phoneNumber: '123-432-5432',
            address: { street1: 'Some Street' }
          }
        })
        .expect(http.OK, function() {
          User.findOne({email: 'sirmoosealot@test.com'}, function(err, user) {
            user.firstname.should.equal('Mister');
            user.lastname.should.equal('Moosey');
            user.contact.phoneNumber.should.equal('123-432-5432');
            user.contact.address.street1.should.equal('Some Street');
            user.contact.address.street2.should.equal('');
            done();
          })
        });
  });

  it('Delete user endpoint - success', function(done) {
    testSession
        .del('/api/user')
        .expect(http.OK, done);
  });
});
