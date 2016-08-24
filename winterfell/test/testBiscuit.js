var Biscuit = require('../services/biscuit');
var should = require('should');

describe('Biscuit', function () {
    this.timeout(20000);
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
        biscuit.get('test::secret', function(err, secret) {
            should.not.exist(err);
            secret.should.equal('stuff');
            done();
        });
    });


    it('should error if secret does not exist', function(done) {
        biscuit.get('test::not_in_yaml', function(err, secret) {
            err.should.be.Error();
            done();
        });
    });
});
