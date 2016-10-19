var EmailService = require('../services/emailService');
var should = require('should');

describe('EmailService', function () {
  var server;
  var service;

  before(function (done) {
    server = require('../app');
    service = new EmailService(server.app);
    done();
  });

  it('Should call sendTextEmail without error', function(done) {
    var promise = service.sendTextEmail('test@test.com', 'subject', 'body');

    promise.done(function (response) {
      done();
    }, function() {
      throw new Error();
    });
  })
});
