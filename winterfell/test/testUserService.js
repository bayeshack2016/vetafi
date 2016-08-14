var should = require('should');
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

  it('Create new user - invalid email', function(done) {
    var user = {
      email: 'badEmail',
      password: 'asdfqwer',
    };

    // Execute
    UserService.createNewUser(user, function(err, user) {
      err.code.should.equal(http.BAD_REQUEST);
      err.msg.should.equal(httpErrors.INVALID_EMAIL);
      done();
    });
  });

  it('Create new user - invalid password', function(done) {
    var user = {
      email: 'moose@test.com',
      password: 'asdf',
    };

    // Execute
    UserService.createNewUser(user, function(err, user) {
      err.code.should.equal(http.BAD_REQUEST);
      err.msg.should.equal(httpErrors.INVALID_PASSWORD);
      done();
    });
  });

  it('Create new user - success', function(done) {
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };

    // Execute
    UserService.createNewUser(userInput, function() {
      User.findOne({email: 'moose@test.com'}).exec(function(err, user) {
        user.email.should.equal('moose@test.com');
        user.state.should.equal(User.State.ACTIVE);
        done();
      });
    });
  });

  it('Set user state', function(done) {
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };
    UserService.createNewUser(userInput, function() {
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
