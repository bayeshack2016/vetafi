'use strict';
var app = angular.module('vetafiApp');
app.controller('editProfileCtrl', ['$scope', 'user', 'net', 'Profile',
  function($scope, user, net, Profile) {
    $scope.userDraft = _.cloneDeep(user);

    function validateEmail(email) {
      if (!email) {
        return false;
      }
      var atInd = email.indexOf('@');
      var dotInd = email.indexOf('.');
      return atInd > -1 && dotInd > atInd;
    }

    function validateEmails() {
      return $scope.userDraft.email == user.email ||
          (
            validateEmail($scope.userDraft.email)
            && validateEmail($scope.userDraft.confirmEmail)
            && $scope.userDraft.email == $scope.userDraft.confirmEmail
          );
    }

    $scope.allFilled = function() {
      return $scope.userDraft.firstname && $scope.userDraft.lastname
        && validateEmails()
        && $scope.userDraft.contact.address.name
        && $scope.userDraft.contact.address.street1
        && $scope.userDraft.contact.address.country
        && $scope.userDraft.contact.address.city
        && $scope.userDraft.contact.address.province
        && $scope.userDraft.contact.address.postal;
    };

    $scope.saveInfo = function() {
      if (!$scope.allFilled()) {
        return;
      }

      net.editUserInfo($scope.userDraft).then(
        function(resp) { // success case
          var updatedUser = resp.data.user;
          Profile.setUser(updatedUser);
          $scope.$close(updatedUser);
        }, function(errResp) { // failed case
          console.log('Woops error ' + JSON.stringify(errResp));
        }
      );
    };

    //
    // Template Constants
    //

    $scope.nameGroup = {
      feedbackFn: function() { return $scope.userDraft.firstname && $scope.userDraft.lastname ? 'has-success' : 'has-error'; },
      fields: [
        {
          label: 'First name',
          ngModel: 'firstname',
          placeholder: 'Enter your first name'
        },
        {
          label: 'Middle name',
          ngModel: 'middlename',
          placeholder: 'Enter your middle name (if any)'
        },
        {
          label: 'Last name',
          ngModel: 'lastname',
          placeholder: 'Enter your last name'
        }
      ]
    };

    $scope.emailGroup = {
      feedbackFn: function() { return validateEmails() ? 'has-success' : 'has-error'; },
      fields: [
        {
          label: 'Primary email',
          ngModel: 'email',
          placeholder: 'Enter your email address'
        },
        {
          label: 'Confirm email',
          ngModel: 'confirmEmail',
          placeholder: 'Re-enter your email address (if changing email)'
        }
      ]
    };

    $scope.validateAddressField = function(field) {
      if (field.ngModel == 'street2') { // optional fields
        return '';
      }
      return $scope.userDraft.contact.address[field.ngModel] ? 'has-success' : 'has-error';
    };

    $scope.addressGroup = [
      {
        label: 'Address Name',
        ngModel: 'name',
        placeholder: 'Name of address i.e. Home, Work, etc.'
      },
      {
        label: 'Street address',
        ngModel: 'street1',
        placeholder: 'i.e. 1234 Washington St'
      },
      {
        label: '',
        ngModel: 'street2',
        placeholder: 'i.e. Room, Apartment, Suite No. (if any)'
      },
      {
        label: 'Country',
        ngModel: 'country',
        placeholder: 'Country of residence'
      },
      {
        label: 'City',
        ngModel: 'city',
        placeholder: 'City of residence'
      },
      {
        label: 'State / Province',
        ngModel: 'province',
        placeholder: 'State or province'
      },
      {
        label: 'Zip / Postal',
        ngModel: 'postal',
        placeholder: 'Zip or Postal code'
      },
    ];

  }
]);
