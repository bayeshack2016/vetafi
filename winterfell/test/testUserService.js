var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var SocialUser = require('../utils/socialUser');
var User = require('../models/user');
var UserService = require('../services/userService');

describe('UserService', function() {

  before(function(done) {
    User.remove({}, function() {
      done();
    });
  });

  it('Create new user - invalid email', function(done) {
    var userInput = {
      email: 'badEmail',
      password: 'asdfqwer',
    };

    // Execute
    UserService.createNewUser(userInput, function(err, user) {
      err.code.should.equal(http.BAD_REQUEST);
      err.msg.should.equal(httpErrors.INVALID_EMAIL);
      done();
    });
  });

  it('Create new user - invalid password', function(done) {
    var userInput = {
      email: 'moose@test.com',
      password: 'asdf',
    };

    // Execute
    UserService.createNewUser(userInput, function(err, user) {
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

  xit('SocialUser - new user', function(done) {
    done();
  });

  xit('SocialUser - existing user, new social', function(done) {
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };
    UserService.createNewUser(userInput, function(err, user) {
      done();
    });
  });

  xit('SocialUser - existing user, existing social, email matches', function(done) {
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      user.socialUsers.push({type: social.type, oauthToken: social.token, state: SocialUser.State.ACTIVE});
      user.save(function(err) {
        UserService.findUserWithSocial(social.type, social.token, function(err, user) {
          user.socialUsers[0].type.should.equal(SocialUser.Type.ID_ME);
          user.socialUsers[0].oauthToken.should.equal(social.token);
          user.socialUsers[0].state.should.equal(SocialUser.State.ACTIVE);
          user.socialUsers.length.should.equal(1);
          done();
        });
      });
    });
  });

  xit('SocialUser - existing user, existing social, email mismatch', function(done) {
    var userInput = {
      email: 'moose@test.com',
      password: 'asdfqwer',
    };
    UserService.createNewUser(userInput, function(err, user) {
      done();
    });
  });

});
