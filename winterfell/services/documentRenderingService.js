/**
 * Service for common pdf operations, such as concatenation.
 */
function DocumentRenderingService(app) {
    this.documentRenderingServiceAddress = app.get('documentRenderingServiceAddress');
}

/**
 * Concatenate an array of documents into one PDF
 * @param documents [Document]
 * @param callback function
 */
DocumentRenderingService.prototype.concatenateDocs = function (documents, callback) {
    request({
        url: config.address + 'concat/',
        method: 'POST',
        json: documents.map(function(doc) {
            return doc.pdf
        }),
        headers: {'Accept': 'application/pdf'}
    }, function (error, microserviceResponse, body) {
        if (error) {
            console.error(error);
            callback(error, null);
            return;
        }

        if (microserviceResponse.statusCode !== 200) {
            callback(microserviceResponse, null);
            return;
        }

        callback(null, microserviceResponse.body);
    });
};


