var request = require('request');
var config = require('../config/documentRendering');
var redis = require("redis"),
    client = redis.createClient();
var uuid = require('uuid');
/**
 * Endpoint for rendering a PDF form with populated information.
 *
 * Uses a post - redirect - get pattern to serve the PDF,
 * as this is the most browser friendly.
 *
 * 1. Relay the posted JSON body to the microservice and collect the rendered document.
 * 2. Store the rendered document in redis along with the session key, under a randomly generated document key.
 * 3. Redirect to another route, with the document key as a path parameter.
 * 4. Retrieve document from redis and if session key matches, return 200, otherwise return 404
 */
module.exports = function (app) {

    app.post('/render/:form', function (req, res) {
        if (req.session.key) {
            request({
                url: config.address + req.params.form,
                method: 'POST',
                json: req.body,
                headers: {'Accept': 'application/pdf'}
            }, function (error, microserviceResponse, body) {
                if (error) {
                    console.error(error);
                    res.sendStatus(500);
                    return;
                }

                if (microserviceResponse.statusCode !== 200) {
                    res.sendStatus(microserviceResponse.statusCode);
                    return;
                }

                var renderedDocumentId = uuid.v4();
                client.hset(req.session.key, renderedDocumentId, microserviceResponse.body);
                res.redirect('/document/' + renderedDocumentId);
            });
        } else {
            res.sendStatus(404);
        }
    });

    app.get('/document/:id', function (req, res) {
        if (req.session.key) {
            client.hget(
                req.session.key,
                req.params.id,
                function (err, data) {
                    if (err) {
                        res.sendStatus(500);
                    }

                    res
                        .status(200)
                        .set('Content-Type', 'application/pdf')
                        .send(data);
                }
            )
        } else {
            res.sendStatus(404);
        }
    });
};
