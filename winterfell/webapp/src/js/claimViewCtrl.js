'use strict';
var app = angular.module('vetafiApp');
app.controller('claimViewCtrl', ['$scope', '$stateParams', 'claimService', 'net','formTemplateService',
  function($scope, $stateParams, claimService, net, formTemplateService) {
    $scope.claimId = $stateParams.claimId;
    $scope.isEmailCollapsed = false;
    $scope.isAddressCollapsed = false;

    // Main claim object
    $scope.claim = {};
    // $scope.claim = { // Fake object for UI-viewing
    //   officialId: '1234566-F',
    //   state: 'submitted',
    //   lastModifiedAt: '3/26/2016',
    //   claimant: {
    //     firstname: 'Aaron',
    //     lastname: 'Hsu'
    //   },
    //   veteran: {
    //     firstname: 'Aaron',
    //     lastname: 'Hsu'
    //   },
    //   emails: [
    //     'ahsu1230@gmail.com',
    //     'aaron@vetafi.org'
    //   ],
    //   addresses: [
    //     {
    //       name: 'VA',
    //       line1: '123 Somewhere Street',
    //       line2: '',
    //       city: 'Governtown',
    //       state: 'Washington D.C.',
    //       country: 'USA',
    //       zip: '20543'
    //     },
    //     {
    //       name: 'Home',
    //       line1: '123 Somewhere Street',
    //       line2: 'Apt 546',
    //       city: 'Governtown',
    //       state: 'Washington D.C.',
    //       country: 'USA',
    //       zip: '20543'
    //     }
    //   ],
    //   formIds: ['VBA-21-0966-ARE', 'VBA-21-0966-ARE']
    // };

    $scope.downloadForm = function(form) {
      console.log("Download user's completed form " + form.id);
    };

    function init() {
      // Initialiaze form array
      $scope.claim.forms = [];
      _.forEach($scope.claim.formIds, function(formId) {
        $scope.claim.forms.push({
          id: formId,
          name: formTemplateService[formId].unofficialTitle,
          // TODO (download link)
        });
      });
    }

    init();
  }
]);
