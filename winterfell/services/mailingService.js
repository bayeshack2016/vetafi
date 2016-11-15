var lob = require('Lob');
var Constants = require('./../utils/constants');
var Form = require('./../models/form');
var Letter = require('./../models/letter');
var User = require('./../models/user');
var DocumentRenderingService = require('./documentRenderingService');
var ENVIRONMENT = Constants.environment;
var Q = require('q');

/**
 * Abstraction around a mailing api.
 *
 * We should use this abstraction and not the Lob api directly
 * so that it will be simple to switch mailing apis in the future
 * if we have need to.
 */
function MailingService(app) {
    if (app.environment == ENVIRONMENT.TEST || app.environment == ENVIRONMENT.LOCAL) {
        this.testMode = true;
        this.Lob = {letters: {create: function(x, cb) { cb(null, {});}}}; // mock
    } else {
        this.testMode = false;
        this.Lob = lob(app.get(Constants.KEY_LOB_API), {
            apiVersion: '2016-06-30'
        });
    }
    this.app = app;
}

module.exports = MailingService;

/**
 * Send a set of rendered documents to the recipient.
 *
 * @param user User sending message
 * @param fromAddress User's return address
 * @param toAddress DestinationAddress
 * @param forms Array of Form
 * @returns Q promise
 */
MailingService.prototype.sendLetter = function (user, fromAddress, toAddress, forms) {
    var deferred = Q.defer();
    var that = this;
    var documentRenderingService = new DocumentRenderingService(this.app);
    documentRenderingService.concatenateDocs(forms, function(documentRenderingError, pdf) {
        if (documentRenderingError) {
            deferred.reject(documentRenderingError);
            return;
        }

        that.Lob.letters.create({description: 'Description',
            to: {
                name: toAddress.name || '',
                address_line1: toAddress.line1 || '',
                address_line2: toAddress.line2 || '',
                address_city: toAddress.city || '',
                address_state: toAddress.state || '',
                address_zip: toAddress.zip || '',
                address_country: toAddress.country || ''
            },
            from: {
                name: fromAddress.name || '',
                address_line1: fromAddress.line1 || '',
                address_line2: fromAddress.line2 || '',
                address_city: fromAddress.city || '',
                address_state: fromAddress.state || '',
                address_zip: fromAddress.zip || '',
                address_country: fromAddress.country || ''
            },
            file: new Buffer(pdf),
            double_sided: true,
            color: false,
            address_placement: 'insert_blank_page'
        }, function (lobError, res) {
            if (lobError) {
                deferred.reject(lobError);
                return;
            }
            Letter.create({
                vendorId: res.id,
                expectedDeliveryDate: res.expected_delivery_date,
                toAddress: fromAddress,
                fromAddress: toAddress,
                documents: forms.map(function(form) {
                    return form.pdf;
                }),
                user: user._id
            }, function(databaseError, doc) {
                if (databaseError) {
                    deferred.reject(databaseError);
                    return;
                }

                deferred.resolve(doc);
            });
        });
    });

    return deferred.promise;
};
