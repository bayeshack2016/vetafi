var lob = require('Lob');
var Document = require('./../models/document');
var Letter = require('./../models/letter');
var UserAddress = require('./../models/userAddress');
var DestinationAddress = require('./../models/destinationAddress');
var DocumentRenderingService = require('./documentRenderingService');

/**
 * Abstraction around a mailing api.
 *
 * We should use this abstraction and not the Lob api directly
 * so that it will be simple to switch mailing apis in the future
 * if we have need to.
 */
function MailingService(app) {
    this.Lob = lob(app.get('lobApiKey'), {
        apiVersion: '2016-06-30'
    });
    this.app = app;
}

module.exports = MailingService;

/**
 * Send a set of rendered documents to the recipient.
 *
 * @param recipient DestinationAddress
 * @param sender UserAddress
 * @param documents Array of Document
 * @param callback function
 */
MailingService.prototype.sendLetter = function (sender, recipient, documents, callback) {
    var that = this;
    var documentRenderingService = new DocumentRenderingService(this.app);
    documentRenderingService.concatenateDocs(documents, function(documentRenderingError, pdf) {
        if (documentRenderingError) {
            callback(documentRenderingError, null);
            return;
        }

        that.Lob.letters.create({description: "Description",
            to: {
                name: recipient.name,
                address_line1: recipient.addressLine1,
                address_line2: recipient.addressLine2,
                address_city: recipient.addressCity,
                address_state: recipient.addressState,
                address_zip: recipient.addressZip,
                address_country: recipient.addressCountry
            },
            from: {
                name: sender.name,
                address_line1: sender.addressLine1,
                address_line2: sender.addressLine2,
                address_city: sender.addressCity,
                address_state: sender.addressState,
                address_zip: sender.addressZip,
                address_country: sender.addressCountry
            },
            file: pdf
        }, function (lobError, res) {
            if (lobError) {
                callback(lobError, null);
                return;
            }

            Letter.create({
                vendorId: res.id,
                expectedDeliveryDate: res.expected_delivery_date,
                recipient: recipient._id,
                sender: sender._id,
                documents: documents.map(function(doc) {
                    return doc._id;
                }),
                user: sender.user
            }, function(databaseError, doc) {
                if (databaseError) {
                    callback(databaseError, null);
                    return;
                }

                callback(null, doc);
            });
        });
    });
};
