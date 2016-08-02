var DocumentRenderingService = require('../services/documentRenderingService');
var should = require('should');

describe('DocumentRenderingService', function () {
    var server;
    var service;

    before(function () {
        server = require('../app');
        service = new DocumentRenderingService(server.app);
    });

    after(function() {
        server.close();
    });

    it('Should concatenate docs.', function(done) {
        service.concatenateDocs([], function(err, body) {
            should.not.exist(err);
            body.length.should.be.greaterThan(0);
            done();
        });
    });
});