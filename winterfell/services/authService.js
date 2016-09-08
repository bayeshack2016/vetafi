var _ = require('lodash');
var SocialUser = require('../utils/socialUser');
var User = require('../models/user');
var UserValues = require('../models/userValues');
var UserService = require('../services/userService');

function AuthService (app) {
    this.app = app;
};

module.exports = AuthService;
module.exports.isPasswordCorrect = function (expectedPwd, candidatePwd) {
  console.log('[AuthService] compare passwords: ' + expectedPwd + ' vs. ' + candidatePwd);
  if (_.isEqual(expectedPwd, candidatePwd)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Helper method to handle any social logic.
 * This method requires a type (ID.Me, Facebook, etc.), a token from that social,
 * an email, and the response body to fill in user information
 */
module.exports.handleSocial = function(socialType, socialToken, socialEmail, socialBody, callback) {
  // find user with ACTIVE socialUser with (type, token)
  UserService.findUserWithSocial(socialType, socialToken, function(err, user) {
    if (err) {
      callback(err, null)
    } else if (user) {
      callback('user-already-exists', null);
    } else {
      // find a user with matching email from social
      User.findOne({email: socialEmail}, function(err, user) {
        if (err) {
          callback(err, null);
        } else if (user) {
          // Add social to user
          user.socialUsers.push({type: socialType, oauthToken: socialToken, state: SocialUser.State.ACTIVE});
          user.save(function() {
            callback(null, user);
          });
        } else {
          // Create new user and UserValues, then add social to user
          if (socialType == SocialUser.Type.ID_ME) {
            UserService.createNewUserFromIdMe(socialBody, function(err, user) {
              UserValues.create({}, function() {
                UserService.addSocialUser(user._id, socialType, socialToken, callback);
              });
            });
          } else {
            console.log('[authHandleSocial] unrecognized social type');
            callback('invalid-social-type', null);
          }
        }
      });
    }
  });
};
