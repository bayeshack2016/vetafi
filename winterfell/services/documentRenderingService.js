var request = require('request');
var Q = require('q');
var _ = require('lodash');
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
    request.post({
        url: this.documentRenderingServiceAddress + 'concat',
        formData: formData,
        encoding: null
    }, function optionalCallback(multipartPostError, httpResponse, body) {
        if (multipartPostError) {
            callback(multipartPostError, null);
            return;
        }
        callback(null, body);
    });
};

/**
 * Convert {key: val, key2: val2} to
 * [{fieldName: key, fieldValue: val}, {fieldName: key2, fieldValue: val2}]
 */
function convertUserValuesToArray(obj) {
    var output = [];
    _.forEach(obj, function(value, key) {
        output.push({fieldName: key, fieldValue: value});
    });
    console.log(output);
    return output;
}

/**
 * Render a PDF with the supplied values.
 */
DocumentRenderingService.prototype.renderDoc = function (formName, values) {
    var deferred = Q.defer();
    request({
        url: this.documentRenderingServiceAddress + 'create/' + formName,
        method: 'POST',
        json: convertUserValuesToArray(values),
        headers: {'Accept': 'application/pdf'},
        encoding: null
    }, function (error, microserviceResponse, body) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(body);
        }
    });
    return deferred.promise;
};


