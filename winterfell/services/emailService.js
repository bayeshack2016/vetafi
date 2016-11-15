var AWS = require('./../config/aws');
var Constants = require('./../utils/constants');
var ENVIRONMENT = Constants.environment;
var Q = require('q');
var FROM_ADDRESS = 'noreply@vetafi.org';

/**
 * Abstraction around an emailing api.
 *
 * We should use this abstraction and not the AWS SES api directly
 * so that it will be simple to switch emailing apis in the future
 * if we have need to.
 */
function EmailService(app) {
  if (app.environment == ENVIRONMENT.TEST || app.environment == ENVIRONMENT.LOCAL) {
    this.testMode = true;
  } else {
    this.testMode = false;
    this.ses = new AWS.SES();
  }

  this.app = app;
}

module.exports = EmailService;

/**
 * Send one plain text email to an address, using the default from address.
 *
 * @param toAddress recipient email address
 * @param subject subject line
 * @param content content of the email
 * @returns Promise
 */
EmailService.prototype.sendTextEmail = function (toAddress, subject, content) {
  var deferred = Q.defer();

  if (this.testMode) {
    deferred.resolve({});
    return deferred.promise;
  }

  this.ses.sendEmail({
    Destination: {
      BccAddresses: [],
      CcAddresses: [],
      ToAddresses: [
        toAddress
      ]
    },
    Message: {
      Body: {
        Text: {
          Data: content,
          Charset: 'UTF8'
        }
      },
      Subject: {
        Data: subject,
        Charset: 'UTF8'
      }
    },
    Source: FROM_ADDRESS,
    ReplyToAddresses: []
  }, function (err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};
