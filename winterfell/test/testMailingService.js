var MailingService = require('../services/mailingService');
var should = require('should');
var fs = require('fs');

var DestinationAddress = require('../models/destinationAddress');
var UserAddress = require('../models/userAddress');
var Letter = require('../models/letter');
var Document = require('../models/document');
var User = require('../models/document');

var mockLob = {
    letters: {
        create: function (req, callback) {
            callback(null, {});
        }
    }
};

var testUser = {
    firstname: "FirstName",
    middlename: "MName",
    lastname: "LastName",
    email: "test@test.com",
    externalId: "value",
    password: "password"
};

var testUserAddress = {
    name: "Name", // Name line
    addressLine1: "Address1",
    addressLine2: "Address2",
    addressCity: "City",
    addressState: "State",
    addressZip: "Zip",
    addressCountry: "Country"
};

var testDestinationAddress = {
    key: "Office",
    name: "Name", // Name line
    addressLine1: "Address1",
    addressLine2: "Address2",
    addressCity: "City",
    addressState: "State",
    addressZip: "Zip",
    addressCountry: "Country"
};

var testDocument = {
    key: "documentName",
    pdf: fs.readFileSync('./test/resources/VBA-21-526EZ-ARE.pdf')
};

describe('Mailing', function () {
    var server;
    var service;
    var testUserInstance;
    var testDocumentInstance;
    var testUserAddressInstance;
    var testDestinationAddressInstance;

    before(function (done) {
        server = require('../app');
        service = new MailingService(server.app);
        service.Lob = mockLob;

        User.create(testUser, function (userErr, user) {
            testUserInstance = user;
            testUserAddress.user = user._id;
            UserAddress.create(testUserAddress, function (userErr, userAddress) {
                testUserAddressInstance = userAddress;
                DestinationAddress.create(testDestinationAddress, function (destinationErr, destinationAddress) {
                    testDestinationAddressInstance = destinationAddress;
                    testDocument.user = user._id;
                    Document.create(testDocument, function (documentErr, document) {
                        testDocumentInstance = document;
                        done();
                    });
                });
            })
        })
    });

    after(function () {
        server.close();
    });

    it('Should send letter without error', function (done) {
        service.sendLetter(
            testUserAddressInstance,
            testDestinationAddressInstance,
            [testDocumentInstance],
            function (sendLetterErr, letter) {
                should.not.exist(sendLetterErr);
                Letter.findOne({_id: letter._id}, function(queryErr, letter) {
                    should.not.exist(queryErr);
                    letter.user.should.deepEqual(testUserInstance._id);
                    letter.sender.should.deepEqual(testUserAddressInstance._id);
                    letter.recipient.should.deepEqual(testDestinationAddressInstance._id);
                    done();
                });
            });
    })
});