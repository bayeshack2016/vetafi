var Biscuit = require('../services/biscuit');
var should = require('should');

describe('Biscuit', function () {
    var server;
    var biscuit;
    before(function () {
        server = require('../app');
        biscuit = new Biscuit(server.app);
    });

    after(function () {
        server.close();
    });

    it('should return secrets that exist', function(done) {
        var secret = biscuit.get('test::secret');
        secret.should.equal('stuff');
        done();
    });


    it('should error if secret does not exist', function(done) {
        should(function () {
            biscuit.get('test::not_in_yaml')
        }).throw(Error);
        done();
    });
});
