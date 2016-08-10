var _ = require('lodash');
var should = require('should');
var sinon = require('sinon');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('../services/userService');

describe('UserValuesService', function() {
  var targetUser = undefined;

  before(function(done) {
    // Remove all users and create one user
    User.remove({}, function() {
      var user = {
        firstname: 'User1',
        lastname: 'McUser',
        email: 'user1@email.com',
        password: 'testword',
        state: User.State.ACTIVE
      };
      User.create(user, function(err, user) {
        targetUser = user;
        done();
      });
    });
  });

  beforeEach(function(done) {
    // Clear all UserValues
    UserValues.remove({}, function() {
      done();
    });
  });

  it('Error Case: Non existent user', function(done) {
    UserService.upsertUserValues('asdf', {'some_key': 'some_value'}, function(err, update) {
      Boolean(err).should.equal(true);
      Boolean(update).should.equal(false);
      done();
    });
  });

  it('Add a userValue', function(done) {
    UserService.upsertUserValues(targetUser._id, {'some_key': 'some_value'}, function(err, update) {
      Boolean(err).should.equal(false);
      update.userId.should.equal(targetUser._id);
      update.values.some_key.should.equal('some_value');
      done();
    });
  });

  it('Update a userValue', function(done) {
    UserService.upsertUserValues(targetUser._id, {'some_key': 'some_value'}, function() {
      UserService.upsertUserValues(targetUser._id, {'some_key': 'some_other_value'}, function(err, update) {
        Boolean(err).should.equal(false);
        update.values.some_key.should.equal('some_other_value');
        done();
      });
    });
  });

  it('Get userValues', function(done) {
    UserService.upsertUserValues(targetUser._id, {'some_key1': 'some_value'}, function() {
      UserService.upsertUserValues(targetUser._id, {'some_key2': 'some_other_value'}, function() {
        UserValues.findOne({userId: targetUser._id}, function(err, userValues) {
          userValues.values.some_key1.should.equal('some_value');
          userValues.values.some_key2.should.equal('some_other_value');
          _.size(userValues.values).should.equal(2);
          done();
        });
      });
    });
  });

});
