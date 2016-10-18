'use strict';
var app = angular.module('vetafiApp');
app.controller('claimViewCtrl', ['$scope', '$stateParams', 'net', 'claimService', 'Profile', 'formTemplateService', 'claim', 'claimForms',
  function($scope, $stateParams, net, claimService, Profile, formTemplateService, claim, claimForms) {
    $scope.user = Profile.user.user;
    $scope.claim = claim.claim;
    $scope.claim.forms = claimForms;
    $scope.claimId = $stateParams.claimId;
    $scope.isEmailCollapsed = false;
    $scope.isAddressCollapsed = false;

    $scope.downloadForm = function(form) {
      console.log("Download user's completed form " + form.id);
    };

    function init() {
      // Initialiaze form array
      _.forEach($scope.claim.forms, function(form) {
        form.name = formTemplateService[form.id].unofficialTitle;
        // TODO (download link)
      });
    }

    init();
  }
]);
