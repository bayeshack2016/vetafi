var MailingService = require('../services/mailingService');
var should = require('should');
var fs = require('fs');
var Constants = require('./../utils/constants');
var ENVIRONMENT = Constants.environment;
var User = require('../models/user');
var Form = require('../models/form');
var Letter = require('../models/letter');

var mockLob = {
    letters: {
        create: function (req, callback) {
            callback(null, {});
        }
    }
};

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

var testForm = {
    key: "documentName",
    pdf: fs.readFileSync('./test/resources/VBA-21-526EZ-ARE.pdf')
};

var testUser = {
    firstname: 'Sir',
    middlename: 'Moose',
    lastname: 'Alot',
    email: 'sirmoosealot@test.com',
    password: 'qwerasdf',
    externalId: 'extId',
    state: User.State.ACTIVE
};

describe('Mailing', function () {
    this.timeout(10000);
    var server;
    var service;
    var testUserInstance;
    var testFormInstance;

    before(function (done) {
        server = require('../app');
        service = new MailingService(server.app);

        var promise = User.remove({});

        promise = promise.then(function() {
            return Letter.remove({});
        });

        promise = promise.then(function() {
            return Form.remove({});
        });

        promise = promise.then(function () {
            return User.create(testUser);
        });

        promise = promise.then(function (user) {
            testUserInstance = user;
            testForm.user = user._id;
            return Form.create(testForm);
        });

        promise.then(function (form) {
            testFormInstance = form;
            done();
        });
    });

    after(function () {
        server.close();
    });

    it('Should send letter without error', function (testDone) {
        var promise = service.sendLetter(
            testUserInstance,
            testReturnAddess,
            testDestinationAddress,
            [testFormInstance]);

        promise = promise.then(function (letter) {
            var k;
            letter.user.should.deepEqual(testUserInstance._id);
            for (k in testDestinationAddress) {
                if (testDestinationAddress.hasOwnProperty(k)) {
                    letter.toAddress[k].should.equal(testDestinationAddress[k]);
                }
            }

            for (k in testReturnAddess) {
                if (testReturnAddess.hasOwnProperty(k)) {
                    letter.fromAddress[k].should.equal(testReturnAddess[k]);
                }
            }
            testDone();
        });

        promise.catch(function (err) {
            throw new Error(err);
        }).done();
    })
});
