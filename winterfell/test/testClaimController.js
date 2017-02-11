'use strict';
var should = require('should');
var http = require('http-status-codes');
var httpErrors = require('./../utils/httpErrors');
var Claim = require('../models/claim');
var Form = require('./../models/form');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('./../services/userService');
var session = require('supertest-session');
var uuid = require('uuid');
var StringDecoder = require('string_decoder').StringDecoder;
var csrfTestUtils = require('./csrfTestUtils');

var testReturnAddess = {
  name: "Name",
  street1: "Address1",
  street2: "Address2",
  city: "City",
  province: "State",
  postal: "Zip",
  country: "Country"
};

var testDestinationAddress = {
  name: "Name", // Name line
  street1: "Address1",
  street2: "Address2",
  city: "City",
  province: "State",
  postal: "Zip",
  country: "Country"
};

describe('ClaimController', function() {
  var targetUser;
  var server;
  var testSession;
  var csrfToken;
  var originalPwd = 'qwerasdf';

  var userInput = {
    firstname: 'Sir',
    middlename: 'Moose',
    lastname: 'Alot',
    email: 'sirmoosealot@test.com',
    password: originalPwd
  };

  before(function(done) {
    server = require('../app');
    testSession = session(server);

    User.remove({}, function() {
      UserService.createNewUser(userInput, function(err, user) {
        targetUser = user;
        done();
      });
    });
  });

  beforeEach(function(done) {
    Claim.remove({}, done);
  });

  it('Get claims for user - 404 if not authed', function(done) {
    testSession
      .get('/api/claims')
      .expect(http.NOT_FOUND, done);
  });

  it('should sign in', function (done) {
    testSession.get('/')
      .expect(200)
      .end(function(err, res) {
        csrfToken = csrfTestUtils.getCsrf(res);
        testSession.post('/api/auth/login')
          .send({email: targetUser.email, password: originalPwd, _csrf: csrfToken})
          .expect(http.MOVED_TEMPORARILY, done);
      });
  });

  it('Create claim for user - success', function(done) {
    testSession
      .post('/api/claims/create')
      .set('X-XSRF-TOKEN', csrfToken)
      .expect(http.CREATED, done);
  });

  it('Get claim - claim dne', function(done) {
    testSession
      .post('/api/claims/create')
      .set('X-XSRF-TOKEN', csrfToken)
      .expect(http.OK, function() {
        testSession
          .get('/api/claim/qwer')
          .expect(http.NOT_FOUND, done);
      });
  });

  it('Get claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim).then(function(createdClaim) {
      console.log(createdClaim);
      testSession
        .get('/api/claim/' + createdClaim._id)
        .expect(http.OK, done);
    });
  });

  it('Get claims for user - success', function(done) {
    var claimsArr = [
      {
        userId: targetUser._id,
        state: Claim.State.INCOMPLETE
      },
      {
        userId: targetUser._id,
        state: Claim.State.INCOMPLETE
      }
    ];
    Claim.create(claimsArr).then(function(createdClaims) {
      testSession
        .get('/api/claim/' + createdClaims[0]._id)
        .expect(http.OK, function() {
          testSession
            .get('/api/claim/' + createdClaims[1]._id)
            .expect(http.OK, done);
        });
    });
  });

  it('Submit claim - claim dne', function(done) {
    var claim = {
      userId: targetUser._id,
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim).then(function(createdClaim) {
      testSession
        .post('/api/claim/qwer/submit')
        .set('X-XSRF-TOKEN', csrfToken)
        .expect(http.NOT_FOUND, done);
    });
  });

  it('Submit claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim).then(function (createdClaim) {
      testSession
        .post('/api/claim/' + createdClaim._id + '/submit')
        .set('X-XSRF-TOKEN', csrfToken)
        .send({
          returnAddress: testReturnAddess,
          toAddress: testDestinationAddress,
          emails: ['some-email@gmail.com'],
          addresses: [testDestinationAddress]
        })
        .expect(function (res) {
          res.body.letter.toAddress.should.deepEqual(testToAddress);
          res.body.letter.fromAddress.should.deepEqual(testFromAddress);
          res.body.claim.state.should.equal(Claim.State.SUBMITTED);
          res.body.claim.emails[0].should.equal('some-email@gmail.com');
          res.body.claim.addresses[0].street1.should.equal(testDestinationAddress.street1);
        })
        .expect(http.OK, done());
    });
  });

  it('Delete claim - claim dne', function(done) {
    var claim = {
      userId: targetUser._id,
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim).then(function(createdClaim) {
      testSession
        .del('/api/claim/qwer')
        .set('X-XSRF-TOKEN', csrfToken)
        .expect(http.NOT_FOUND, done);
    });
  });

  it('Delete claim - success', function(done) {
    var claim = {
      userId: targetUser._id,
      state: Claim.State.INCOMPLETE
    };
    Claim.create(claim).then(function(createdClaim) {
      testSession
        .del('/api/claim/' + createdClaim._id)
        .set('X-XSRF-TOKEN', csrfToken)
        .expect(http.OK, done);
    });
  });
});

describe('SaveClaimController', function () {
  var testSession, server, targetUser, targetClaim, csrfToken;
  var originalPwd = 'qwerasdf';

  before(function (done) {
    this.timeout(20000);
    server = require('../app');
    testSession = session(server);

    // Remove all users and create one user with user values
    var promise = User.remove({});

    promise = promise.then(function () {
      return UserValues.remove({});
    });

    promise = promise.then(function () {
      return Form.remove({});
    });

    promise = promise.then(function () {
      var user = {
        firstname: 'User1',
        lastname: 'McUser',
        email: 'user1@email.com',
        password: originalPwd
      };
      return UserService.createNewUser(user);
    });

    promise = promise.then(function (user) {
      targetUser = user;
      return UserValues.create({userId: user._id});
    });

    promise = promise.then(function (userValues) {
      return Claim.create({user: userValues.userId});
    });


    promise.catch(
      function (err) {
        throw new Error(err);
      }
    ).done(
      function (claim) {
        targetClaim = claim;
        done();
      },
      function (err) {
        throw new Error(err);
      }
    );
  });

  it('should 403 before sign in', function (done) {
    testSession
      .post('/api/save/1/1')
      .expect(http.FORBIDDEN, done);
  });

  it('should sign in', function (done) {
    testSession.get('/')
      .expect(200)
      .end(function(err, res) {
        csrfToken = csrfTestUtils.getCsrf(res);
        testSession.post('/api/auth/login')
          .send({email: targetUser.email, password: originalPwd, _csrf: csrfToken})
          .expect(http.MOVED_TEMPORARILY, done);
      });
  });

  it('Should save the claim form after signin', function(done) {
    testSession
      .post('/api/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({key1: 'value1', key2: 'value2'}) // TODO what form do we want this in?
      .expect(201, function() {
        Form.findOne({key: 'VBA-21-0966-ARE', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          doc.responses.should.deepEqual({key1: 'value1', key2: 'value2'});
          done();
        })
      });
  });

  it('Should correctly calculate progress after save', function(done) {
    testSession
      .post('/api/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({filing_for_self: false})
      .expect(201, function() {
        Form.findOne({key: 'VBA-21-0966-ARE', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          doc.requiredQuestions.should.be.exactly(25);
          doc.answeredRequired.should.be.exactly(1);
          doc.optionalQuestions.should.be.exactly(2);
          doc.answeredOptional.should.be.exactly(0);
          done();
        })
      })
  });

  it('Should correctly calculate progress after save with hidden questions', function(done) {
    testSession
      .post('/api/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({filing_for_self: true})
      .expect(201, function() {
        Form.findOne({key: 'VBA-21-0966-ARE', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          doc.requiredQuestions.should.be.exactly(21);
          doc.answeredRequired.should.be.exactly(1);
          doc.optionalQuestions.should.be.exactly(2);
          doc.answeredOptional.should.be.exactly(0);
          done();
        })
      })
  });

  it('Should render the form after save', function(done) {
    testSession
      .post('/api/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({})
      .expect(201, function() {
        Form.findOne({key: 'VBA-21-0966-ARE', user: targetUser._id}, function(error, doc) {
          should.not.exist(error);
          should.exist(doc);
          var decoder = new StringDecoder('utf8');
          decoder.end(doc.pdf.slice(0, 4)).should.equal('%PDF');
          done();
        })
      })
  });

  it('Should update the user after save', function(done) {
    testSession
      .post('/api/save/' + targetClaim._id + '/VBA-21-0966-ARE')
      .set('X-XSRF-TOKEN', csrfToken)
      .send({
        claimant_first_name: 'jeff',
        veteran_first_name: 'joe',
        veteran_home_city: 'city1'
      })
      .expect(201, function () {
        User.findOne({_id: targetUser._id}, function(error, user) {
          should.not.exist(error);
          should.exist(user);
          user.firstname.should.equal('joe');
          user.contact.address.city.should.equal('city1');
          done();
        })
      });
  });

  it('Should retrieve the rendered form after save', function(done) {
    testSession
      .get('/claim/' + targetClaim._id + '/form/VBA-21-0966-ARE/pdf')
      .expect(200)
      .end(function(err, res) {
        res.text.should.startWith('%PDF');
        done();
      });
  });
});
