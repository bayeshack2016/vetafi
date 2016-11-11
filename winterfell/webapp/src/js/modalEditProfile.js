'use strict';
var app = angular.module('vetafiApp');
app.controller('editProfileCtrl', ['$scope', 'user', 'net', 'Profile',
  function($scope, user, net, Profile) {
    $scope.user = user;

    $scope.validateEmail = function(email) {
      if (!email) {
        return false;
      }

      var atInd = email.indexOf('@');
      var dotInd = email.indexOf('.');
      return atInd > -1 && dotInd > atInd;
    };

    $scope.validateEmails = function() {
      return $scope.validateEmail($scope.user.email)
        && $scope.validateEmail($scope.confirmEmail)
        && $scope.user.email == $scope.confirmEmail;
    };

    $scope.allFilled = function() {
      return $scope.user.firstname && $scope.user.lastname
        && $scope.validateEmails()
        && $scope.user.contact.address.name
        && $scope.user.contact.address.street1
        && $scope.user.contact.address.country
        && $scope.user.contact.address.city
        && $scope.user.contact.address.province
        && $scope.user.contact.address.postal;
    };

    $scope.saveInfo = function() {
      if (!$scope.allFilled()) {
        return;
      }

      var data = {
        firstname: $scope.user.firstname,
        middlename: $scope.user.middlename,
        lastname: $scope.user.lastname,
        email: $scope.user.email,
        address: {
          name: $scope.user.contact.address.name,
          street1: $scope.user.contact.address.street1,
          street2: $scope.user.contact.address.street2,
          country: $scope.user.contact.address.country,
          city: $scope.user.contact.address.city,
          province: $scope.user.contact.address.province,
          postal: $scope.user.contact.address.postal
        }
      };

      net.editUserInfo(data).then(
        function(resp) { // success case
          var updatedUser = resp.data.user;
          Profile.setUser(updatedUser);
          $scope.$close(updatedUser);
        }, function(errResp) { // failed case
          console.log('Woops error ' + JSON.stringify(errResp));
        }
      );
    };

  }
]);


// app.directive("modalEditProfile", ["net", function(net) {
//     return {
//         restrict: "A",
//         scope: {
//           user: '=',
//           closeModal: '&'
//         },
//         link: function(scope, elem, attrs) {
//           debugger;
//
//         }
//     }
// }]);
