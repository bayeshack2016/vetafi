var User = require('./../models/user');
var UserValues = require('./../models/userValues');
var Form = require('./../models/form');
var FileClaim = require('./../models/fileClaim');
var UserService = require('./../services/userService');
var session = require('supertest-session');
var should = require('should');

describe('FileClaimController', function () {
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