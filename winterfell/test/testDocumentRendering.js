var User = require('./../models/user');
var UserService = require('./../services/userService');
var session = require('supertest-session');

describe('DocumentRenderingController', function () {
    this.timeout(2000);
    var server;
    var testSession;
    before(function () {
        server = require('../app');
        testSession = session(server);
    });

    after(function () {
        server.close();
    });

    it('GET / should return 404 before signin', function(done) {
        testSession
            .get('/api/document/fc0ff125-df4c-4abc-a6e0-f390f0534d5e')
            .expect(404, done);
    });

    it('POST / should return 404 before signin', function(done) {
        testSession
            .post('/api/render/form')
            .expect(404, done);
    });

    it('should sign in', function (done) {
        UserService.createNewUser({email: 'test@test.com', password: '1234abcd!'},
          function (error, user) {
              if (error) {
                  done();
                  return;
              }

              testSession.post('/api/auth/login')
                .send({email: 'test@test.com', password: '1234abcd!'})
                .expect(200, done);
          });
    });

    it('POST / should return 404 if form doesnt exist', function (done) {
        testSession
            .post('/api/render/nowayiexist')
            .send([])
            .expect(404, done);
    });

    it('POST / should return 200 with redirect url', function (done) {
        testSession
            .post('/api/render/VBA-21-0781-ARE')
            .send([])
            .expect(200)
            .expect(/\/document\/.*/, done);
    });

    it('POST / redirect url should work', function (done) {
        testSession
            .post('/api/render/VBA-21-0781-ARE')
            .send([])
            .expect(200)
            .expect(/\/document\/.*/)
            .end(function (err, res) {
                testSession
                    .get(res.text)
                    .expect(200)
                    .expect('Content-Type', /application\/pdf/, done);
            });
    });
});
