var request = require('request');
/**
 * Service for common pdf operations, such as concatenation.
 */
function DocumentRenderingService(app) {
    this.documentRenderingServiceAddress = app.get('documentRenderingServiceAddress');
}

module.exports = DocumentRenderingService;

/**
 * Concatenate an array of documents into one PDF
 * @param documents [Document]
 * @param callback function
 */
DocumentRenderingService.prototype.concatenateDocs = function (documents, callback) {
    var attachments = documents.map(function (doc) {
        return {
            value: doc.pdf,
            options: {
                filename: doc.key + '.pdf',
                contentType: 'application/pdf'
            }
        };
    });

    var formData = {
        attachments: attachments
    };
    request.post({url: this.documentRenderingServiceAddress + '/concat', formData: formData},
        function optionalCallback(multipartPostError, httpResponse, body) {
            if (multipartPostError) {
                callback(multipartPostError, null);
                return;
            }
            callback(null, body);
        });
};


