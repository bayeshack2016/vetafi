var User = require('./../models/user');
var UserService = require('./../services/userService');
var session = require('supertest-session');

describe('DocumentRenderingController', function () {
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
            .get('/document/fc0ff125-df4c-4abc-a6e0-f390f0534d5e')
            .expect(404, done);
    });

    it('POST / should return 404 before signin', function(done) {
        testSession
            .post('/render/form')
            .expect(404, done);
    });

    it('should sign in', function (done) {
        var callbacks = {
            onError: function (errorCode, errorMsg) {
                done();
            },
            onSuccess: function (user) {
                testSession.post('/auth/login')
                    .send({email: 'test@test.com', password: '1234abcd!'})
                    .expect(200, done);
            }
        };
        UserService.createNewUser({email: 'test@test.com', password: '1234abcd!'},
            callbacks);
    });

    it('POST / should return 404 if form doesnt exist', function (done) {
        testSession
            .post('/render/nowayiexist')
            .send([])
            .expect(404, done);
    });

    it('POST / should return 200 with redirect url', function (done) {
        this.timeout(10000);
        testSession
            .post('/render/VBA-21-0781-ARE')
            .send([])
            .expect(200)
            .expect(/\/document\/.*/, done);
    });

    it('POST / redirect url should work', function (done) {
        this.timeout(20000);
        testSession
            .post('/render/VBA-21-0781-ARE')
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
