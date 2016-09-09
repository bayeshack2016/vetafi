var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var SocialUser = require('../utils/socialUser');
var User = require('../models/user');
var UserService = require('../services/userService');

describe('UserService', function() {
  var userInput = {
    email: 'moose@test.com',
    password: 'asdfqwer',
    test: true
  };

  before(function(done) {
    User.remove({}, function() {
      done();
    });
  });

  it('Create new user - invalid email', function(done) {
    var badUserInput = {
      email: 'badEmail',
      password: 'asdfqwer',
      test: true
    };

    // Execute
    UserService.createNewUser(badUserInput, function(err, user) {
      err.code.should.equal(http.BAD_REQUEST);
      err.msg.should.equal(httpErrors.INVALID_EMAIL);
      done();
    });
  });

  it('Create new user - invalid password', function(done) {
    var badUserInput = {
      email: 'moose@test.com',
      password: 'asdf'
    };

    // Execute
    UserService.createNewUser(badUserInput, function(err, user) {
      err.code.should.equal(http.BAD_REQUEST);
      err.msg.should.equal(httpErrors.INVALID_PASSWORD);
      done();
    });
  });

  it('Create new user - success', function(done) {
    UserService.createNewUser(userInput, function() {
      User.findOne({email: 'moose@test.com'}).exec(function(err, user) {
        user.email.should.equal('moose@test.com');
        user.state.should.equal(User.State.ACTIVE);
        done();
      });
    });
  });

  it('Set user state', function(done) {
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

  it('SocialUser - add new social user', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      UserService.addSocialUser(user._id, social.type, social.token, function(err, user) {
        should.not.exist(err);
        user.socialUsers[0].type.should.equal(SocialUser.Type.ID_ME);
        user.socialUsers[0].oauthToken.should.equal(social.token);
        user.socialUsers[0].state.should.equal(SocialUser.State.ACTIVE);
        user.socialUsers.length.should.equal(1);
        done();
      });
    });
  });

  it('SocialUser - remove non-existing social user', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      UserService.removeSocialUser(user._id, social.type, function(err, updates) {
        should.not.exist(err);
        updates.nModified.should.equal(0);
        done();
      });
    });
  });

  it('SocialUser - remove existing social user', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      UserService.addSocialUser(user._id, social.type, social.token, function(err, user) {
        should.not.exist(err);
        user.socialUsers[0].type.should.equal(SocialUser.Type.ID_ME);
        user.socialUsers[0].oauthToken.should.equal(social.token);
        user.socialUsers[0].state.should.equal(SocialUser.State.ACTIVE);
        user.socialUsers.length.should.equal(1);
        UserService.removeSocialUser(user._id, social.type, function(err, updates) {
          should.not.exist(err);
          updates.nModified.should.equal(1);
          done();
        });
      });
    });
  });

  it('SocialUser - find user with non-existing socialUser (type mismatch)', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      user.socialUsers.push({type: social.type, oauthToken: social.token, state: SocialUser.State.ACTIVE});
      user.save(function(err) {
        UserService.findUserWithSocial('bad-type', social.token, function(err, user) {
          should.not.exist(user);
          done();
        });
      });
    });
  });

  it('SocialUser - find user with non-existing socialUser (token mismatch)', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      user.socialUsers.push({type: social.type, oauthToken: social.token, state: SocialUser.State.ACTIVE});
      user.save(function(err) {
        UserService.findUserWithSocial(social.type, 'bad-token', function(err, user) {
          should.not.exist(user);
          done();
        });
      });
    });
  });

  it('SocialUser - find user with existing socialUser (user mismatch)', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user1) {
      UserService.findUserWithSocial(social.type, social.token, function(err, user2) {
        // socialUser found is for the original user
        user1._id.should.not.equal(user2._id);
        done();
      });
    });
  });

  it('SocialUser - find user with existing socialUser (but user is INACTIVE)', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user1) {
      user1.state = User.State.INACTIVE;
      user1.save(function() {
        UserService.addSocialUser(user1._id, social.type, social.token, function() {
          UserService.findUserWithSocial(social.type, social.token, function(err, user2) {
            // socialUser found is for the original user
            user1._id.should.not.equal(user2._id);
            done();
          });
        });
      });
    });
  });

  it('SocialUser - find user with existing socialUser (correct user)', function(done) {
    var social = {
      type: SocialUser.Type.ID_ME,
      token: "some-random-token"
    };
    UserService.createNewUser(userInput, function(err, user) {
      UserService.addSocialUser(user._id, social.type, social.token, function() {
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

});
