var lob = require('Lob');
var Constants = require('./../utils/constants');
var Document = require('./../models/document');
var Letter = require('./../models/letter');
var User = require('./../models/user');
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
    this.Lob = lob(app.get(Constants.KEY_LOB_API), {
        apiVersion: '2016-06-30'
    });
    this.app = app;
}

module.exports = MailingService;

/**
 * Send a set of rendered documents to the recipient.
 *
 * @param sender User
 * @param recipient DestinationAddress
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

        var senderAddress = sender.contact.address;

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
                name: senderAddress.name,
                address_line1: senderAddress.line1,
                address_line2: senderAddress.line2,
                address_city: senderAddress.city,
                address_state: senderAddress.state,
                address_zip: senderAddress.zip,
                address_country: senderAddress.country
            },
            file: pdf,
            double_sided: true
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
                user: sender._id
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
