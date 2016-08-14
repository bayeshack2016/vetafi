var MailingService = require('../services/mailingService');
var should = require('should');
var fs = require('fs');

var DestinationAddress = require('../models/destinationAddress');
var User = require('../models/user');
var Letter = require('../models/letter');
var Document = require('../models/document');

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
    password: "password",
    state: User.State.ACTIVE,
    contact: {
      address: {
          name: "Name",
          line1: "Address1",
          line2: "Address2",
          city: "City",
          state: "State",
          zip: "Zip",
          country: "Country"
      }
    }
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
    var testDestinationAddressInstance;

    before(function (done) {
        server = require('../app');
        service = new MailingService(server.app);
        service.Lob = mockLob;

        User.remove({}, function() {
          User.create(testUser, function(userErr, user) {
            testUserInstance = user;

            DestinationAddress.create(testDestinationAddress, function (destinationErr, destinationAddress) {
                testDestinationAddressInstance = destinationAddress;
                testDocument.user = user._id;
                Document.create(testDocument, function (documentErr, document) {
                    testDocumentInstance = document;
                    done();
                });
            });
          });
        });
    });

    after(function () {
        server.close();
    });

    it('Should send letter without error', function (done) {
        service.sendLetter(
            testUserInstance,
            testDestinationAddressInstance,
            [testDocumentInstance],
            function (sendLetterErr, letter) {
                should.not.exist(sendLetterErr);
                Letter.findOne({_id: letter._id}, function(queryErr, letter) {
                    should.not.exist(queryErr);
                    letter.user.should.deepEqual(testUserInstance._id);
                    letter.sender.should.deepEqual(testUserInstance._id);
                    letter.recipient.should.deepEqual(testDestinationAddressInstance._id);
                    done();
                });
            });
    })
});
