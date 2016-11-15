'use strict';
var app = angular.module('vetafiApp');
app.controller('claimViewCtrl', ['$scope', '$stateParams', 'net', 'claimService', 'Profile', 'formTemplateService', 'claim', 'claimForms', 'utils',
  function($scope, $stateParams, net, claimService, Profile, formTemplateService, claim, claimForms, utils) {
    $scope.user = Profile.user.user;
    $scope.claim = claim.claim;
    $scope.claim.forms = claimForms;
    $scope.claimId = $stateParams.claimId;
    $scope.isEmailCollapsed = false;
    $scope.isAddressCollapsed = false;

    function init() {
      // Initialiaze form array
      _.forEach($scope.claim.forms, function(form) {
        form.name = formTemplateService[form.key].vfi.title;
      });

      $scope.claim.date = utils.formatServerDate($scope.claim.stateUpdatedAt);
    }

    init();
  }
]);
