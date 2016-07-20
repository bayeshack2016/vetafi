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
 * 4. Retrieve document from redis and if session key matches, return 200, otherwise return 401
 * Then when the redirected get hits,
 */
module.exports = function (app) {

  app.post('/render', function(req, res) {
    if (req.session.key) {
      request({
        url: config.address,
        method: 'POST',
        json: req.body
      }, function(error, response, body) {
        if (error) {
          res.sendStatus(500);
        }

        var renderedDocumentId = uuid.v4();
        client.set(renderedDocumentId, {
          document: body,
          sessionKey: req.session.key
        });
        res.redirect('/document/' + renderedDocumentId);
      });
    } else {
      res.sendStatus(404);
    }
  });

  app.get('/document/:id', function(req, res) {
    if (req.session.key) {
      client.get(
          req.params.id,
          function(err, data) {
            if (err) {
              res.sendStatus(500);
            }

            if (data.sessionKey !== req.session.key) {
              res.sendStatus(403);
            }

            res
                .status(200)
                .set('Content-Type', 'application/pdf')
                .send(data.document);
          }
      )
    } else {
      res.sendStatus(404);
    }
  });

};
