var biscuit = require('../services/biscuit')('/vagrant/config/biscuit/test_secrets.yaml');
var should = require('should');

describe('Biscuit', function () {

    it('should return secrets that exist', function(done) {
        biscuit.get('test::secret', function(err, secret) {
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
