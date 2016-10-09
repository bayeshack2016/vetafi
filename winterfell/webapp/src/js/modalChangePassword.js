'use strict';
var app = angular.module('vetafiApp');
app.directive("modalChangePassword", ["net", function(net) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            function displayError(msg) {
              var errorMsg = $(elem).find('.error-msg');
              errorMsg.text(msg);
            }

            scope.savePassword = function() {
              var oldPwd = $(elem).find('input.old').val();
              var newPwd = $(elem).find('input.new').val();
              var confirmPwd = $(elem).find('input.confirm').val();

              if (newPwd.length < 6) {
                displayError("Your new password is too short.");
                return;
              }

              if (confirmPwd != newPwd) {
                displayError("Your new password and confirm password do not match! Please re-type your new password.");
                return;
              }

              if (newPwd == oldPwd) {
                displayError("Your new password cannot match your old password.");
                return;
              }

              net.changePassword(oldPwd, newPwd).then(
                function(resp) { // success case
                  scope.$close();
                }, function(errResp) { // failed case
                  if ('auth_mismatch' == errResp.data) {
                    displayError("Incorrect current password.");
                  } else {
                    displayError("Sorry, unknown server issue. Please try again later.");
                  }
                }
              );
            };
        }
    }
}]);
