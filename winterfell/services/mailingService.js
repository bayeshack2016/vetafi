var lob = require('Lob');

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
}

/**
 *
 * @param recipiant Recipient
 * @param sender Recipient
 * @param document
 */
MailingService.prototype.sendLetter = function (recipiant, sender, document) {

};





module.exports = {};
