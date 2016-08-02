var should = require('should');
var sinon = require('sinon');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var User = require('../models/user');
var UserService = require('../services/userService');

describe('UserService', function() {

  before(function(done) {
    User.remove({}, function() {
      done();
    });
  });

  after(function () {
  });

  it('Create new user - invalid email', function(done) {
    var callbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
    var mockedCallbacks = sinon.mock(callbacks);
    var user = {
      email: 'badEmail',
      password: 'asdfqwer',
    };
    mockedCallbacks.expects('onError').once().withArgs(http.BAD_REQUEST, httpErrors.INVALID_EMAIL);
    mockedCallbacks.expects('onSuccess').never();

    // Execute
    UserService.createNewUser(user, callbacks);

    // Verify
    mockedCallbacks.verify();
    done();
  });

  it('Create new user - invalid password', function(done) {
    var callbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
    var mockedCallbacks = sinon.mock(callbacks);
    var user = {
      email: 'moose@test.com',
      password: 'asdf',
    };
    mockedCallbacks.expects('onError').once().withArgs(http.BAD_REQUEST, httpErrors.INVALID_PASSWORD);
    mockedCallbacks.expects('onSuccess').never();

    // Execute
    UserService.createNewUser(user, callbacks);

    // Verify
    mockedCallbacks.verify();
    done();
  });

  it('Create new user - success', function(done) {
    var callbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
    var mockedCallbacks = sinon.mock(callbacks);
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };
    mockedCallbacks.expects('onError').never();

    // Execute
    UserService.createNewUser(userInput, callbacks).then(function() {
      User.findOne({email: 'moose@test.com'}).exec(function(err, user) {
        user.email.should.equal('moose@test.com');
        user.state.should.equal(User.State.ACTIVE);

        // Verify
        mockedCallbacks.verify();
        done();
      });
    });
  });

  it('Set user state', function(done) {
    var callbacks = {
      onSuccess: function() {},
      onError: function() {}
    };
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };
    UserService.createNewUser(userInput, callbacks).then(function() {
      User.findOne({email: 'moose@test.com'}).exec(function(err, user) {
        user.email.should.equal('moose@test.com');
        user.state.should.equal(User.State.ACTIVE);

        UserService.setUserState(user._id, User.State.INACTIVE, function(testUser) {
          User.findOne({_id: user._id}).exec(function(err, testUser) {
            testUser.state.should.equal(User.State.INACTIVE);
            done();
          });
        });
      });
    });
  });

});
