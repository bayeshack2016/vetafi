var config = require('../config/documentRendering');
var http = require('http-status-codes');
var Log = require('../utils/logHelper');
var redis = require("redis"),
    client = redis.createClient({'return_buffers': true});
var request = require('request');
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

    app.post('/render/:form', [Log.api], function (req, res) {
        if (req.session.key) {
            request({
                url: config.address + 'create/' + req.params.form,
                method: 'POST',
                json: req.body,
                headers: {'Accept': 'application/pdf'},
                encoding: null
            }, function (error, microserviceResponse, body) {
                if (error) {
                    console.error(error);
                    res.sendStatus(http.INTERNAL_SERVER_ERROR);
                    return;
                }

                if (microserviceResponse.statusCode !== http.OK) {
                    res.sendStatus(microserviceResponse.statusCode);
                    return;
                }

                var renderedDocumentId = uuid.v4();
                client.hset(req.session.key, renderedDocumentId, body);
                res.status(http.OK).send('/document/' + renderedDocumentId);
            });
        } else {
            console.log("[/render/:form] no credentials");
            console.log(req.session);
            res.sendStatus(http.NOT_FOUND);
        }
    });

    app.get('/document/:id', [Log.api], function (req, res) {
        if (req.session.key) {
            client.hget(
                req.session.key,
                req.params.id,
                function (err, data) {
                    if (err) {
                        res.sendStatus(http.INTERNAL_SERVER_ERROR);
                    }

                    res
                        .status(http.OK)
                        .set('Content-Type', 'application/pdf')
                        .send(data);
                }
            )
        } else {
            res.sendStatus(http.NOT_FOUND);
        }
    });
};
