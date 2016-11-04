'use strict';
var app = angular.module('vetafiApp');
app.directive("modalEditProfile", ["net", function(net) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
          scope.validateEmail = function(email) {
            if (!email) {
              return false;
            }

            var atInd = email.indexOf('@');
            var dotInd = email.indexOf('.');
            return atInd > -1 && dotInd > atInd;
          };

          scope.validateEmails = function() {
            return scope.validateEmail(scope.email)
              && scope.validateEmail(scope.confirmEmail)
              && scope.email == scope.confirmEmail;
          };

          scope.allFilled = function() {
            return scope.firstname && scope.lastname
              && scope.validateEmails()
              && scope.addressName
              && scope.street1
              && scope.country
              && scope.city
              && scope.province
              && scope.postal;
          };

          scope.saveInfo = function() {
            var data = {
              firstname: scope.firstname,
              middlename: scope.middlename,
              lastname: scope.lastname,
              email: scope.email,
              address: {
                name: scope.addressName,
                street1: scope.street1,
                street2: scope.street2,
                country: scope.country,
                city: scope.city,
                province: scope.province,
                postalCode: scope.postal
              }
            };

            net.editUserInfo(data).then(
              function(resp) { // success case
                var updatedUser = resp.data.user;
                scope.firstname = updatedUser.firstname;
                scope.middlename = updatedUser.middlename;
                scope.lastname = updatedUser.lastname;
                scope.email = updatedUser.email;
                scope.addressName = updatedUser.address.name;
                scope.street1 = updatedUser.address.street1;
                scope.street2 = updatedUser.address.street2;
                scope.country = updatedUser.address.country;
                scope.city = updatedUser.address.city;
                scope.province = updatedUser.address.province;
                scope.postal = updatedUser.address.postal;
              }, function(errResp) { // failed case
                console.log('Woops error ' + JSON.stringify(errResp));
              }
            );
          };
        }
    }
}]);
