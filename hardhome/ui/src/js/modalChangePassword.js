'use strict';
var app = angular.module('vetafiApp');
app.directive("modalChangePassword", ["net", function(net) {
    return {
        restrict: "A",
        link: function(scope) {
            scope.errorMsg = '';
            function displayError(msg) {
              scope.errorMsg = msg;
            }

            scope.savePassword = function() {
              if (!scope.oldPwd) {
                displayError("Please enter your old password.");
                return;
              }

              if (!scope.newPwd) {
                displayError("Please enter a new password.");
                return;
              }

              if (scope.newPwd && scope.newPwd.length < 6) {
                displayError("Your new password is too short.");
                return;
              }

              if (scope.confirmPwd != scope.newPwd) {
                displayError("Your new password and confirm password do not match! Please re-type your new password.");
                return;
              }

              if (scope.newPwd == scope.oldPwd) {
                displayError("Your new password cannot match your old password.");
                return;
              }

              net.changePassword(scope.oldPwd, scope.newPwd).then(
                function() { // success case
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
