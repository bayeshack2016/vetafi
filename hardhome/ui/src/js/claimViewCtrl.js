'use strict';
var app = angular.module('vetafiApp');
app.controller('claimViewCtrl', ['$scope', '$stateParams', 'net', 'claimService', 'Profile', 'formConfig', 'claim', 'claimForms', '$filter',
  function($scope, $stateParams, net, claimService, Profile, formConfig, claim, claimForms, $filter) {
    $scope.user = Profile.user.user;
    $scope.claim = claim.claim;
    $scope.claim.forms = claimForms;
    $scope.claimId = $stateParams.claimId;
    $scope.isEmailCollapsed = false;
    $scope.isAddressCollapsed = false;

    function init() {
      // Initialiaze form array
      _.forEach($scope.claim.forms, function(form) {
        form.name = formConfig[form.key].vfi.title;
      });

      $scope.claim.date = $filter('date')(new Date($scope.claim.stateUpdatedAt), 'MM/dd/yyyy');
    }

    init();
  }
]);
