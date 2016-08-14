'use strict';
var _ = require('lodash');
var http = require('http-status-codes');
var uuid = require('uuid');
var User = require('../models/user');
var UserService = require('./../services/userService');
var FileClaim = require('../models/fileClaim');
var FileClaimService = require('./../services/fileClaimService');

module.exports = function (app) {

  var TEST_USER_PASSWORD = "testuser1234";
  var TEST_EMAIL = "@test.com";

  //
  // For a spreadsheet, look here:
  // https://docs.google.com/spreadsheets/d/1mjPeP4VtZ17axxSdKj6-X_jnarRyzmjRLayKgqqnF4Q/edit?usp=sharing
  //

  var allTestUsers = [
    // No claim user
    {
      firstName: 'Ned',
      middleName: '',
      lastName: 'Stark',
      email: 'ned' + TEST_EMAIL,
      password: TEST_USER_PASSWORD,
      fileClaimInfos: [],
      documentInfos: [],
      letterInfos: []
    },

    // One INCOMPLETE claim user
    {
      firstName: 'Robb',
      middleName: '',
      lastName: 'Stark',
      email: 'robb' + TEST_EMAIL,
      password: TEST_USER_PASSWORD,
      fileClaimInfos: [FileClaim.State.INCOMPLETE],
      documentInfos: [],
      letterInfos: []
    },

    // One SUBMITTED claim user
    {
      firstName: 'Arya',
      middleName: '',
      lastName: 'Stark',
      email: 'arya' + TEST_EMAIL,
      password: TEST_USER_PASSWORD,
      fileClaimInfos: [FileClaim.State.SUBMITTED],
      documentInfos: [],
      letterInfos: []
    },

    // One PROCESSED claim user
    {
      firstName: 'Sansa',
      middleName: '',
      lastName: 'Stark',
      email: 'sansa' + TEST_EMAIL,
      password: TEST_USER_PASSWORD,
      fileClaimInfos: [FileClaim.State.PROCESSED],
      documentInfos: [],
      letterInfos: []
    }
  ];

  function removeTestUsers(callback) {
    var testEmails = _.map(allTestUsers, 'email');
    console.log('resetting users: ' + JSON.stringify(testEmails));
    var query = { email: {$in: testEmails}, state: User.State.ACTIVE };
    var update = { state: User.State.INACTIVE };
    User.update(query, update, { multi: true }, function(err) {
      if (err) {
        res.status(http.BAD_REQUEST).send({error: JSON.stringify(err)});
      } else {
        callback();
      }
    });
  }

  function createTestUser(userInput) {
    var now = Date.now();
    User.create({
      firstname: userInput.firstName,
      middlename: userInput.middleName,
      lastname: userInput.lastName,
      email: userInput.email,
      password: userInput.password,
      state: User.State.ACTIVE,
      stateUpdatedAt: now,
      admin: false,
      test: true
    }, function(err, user) {
      if (user) {
        createFileClaimForUser(user, userInput.fileClaimInfos);
      }
    });
  }

  function createFileClaimForUser(user, fileClaimInfos) {
    var now = Date.now();
    _.forEach(fileClaimInfos, function(claimState) {
      FileClaim.create({
        externalId: uuid.v4(),
        userId: user._id,
        state: claimState,
        stateUpdatedAt: now
      });
    });
  }

  app.post('/admin/reset-test-users', function (req, res) {
    console.log('Reset test users requested...');
    removeTestUsers(function() {
      _.forEach(allTestUsers, function(userToCreate) {
        createTestUser(userToCreate);
      });
      res.sendStatus(http.OK);
    });
  });

};
