'use strict';
var app = angular.module('vetafiApp');
app.controller('claimViewCtrl', ['$scope', '$stateParams', 'claimService', 'net', 'ngDialog',
  function($scope, $stateParams, claimService, net) {
    $scope.claimId = $stateParams.claimId;
    $scope.claim = {};

    function updateClaim(claim) {
      if (!claim) {
        console.log('claim undefined ' + claim);
        return;
      }
      if (claim.state == 'incomplete') {
        claim.title = 'Last modified on ' + claim.updatedAt;
        claim.subtitle = 'This claim has not been submitted yet.';
      } else if (claim.state == 'submitted') {
        claim.title = 'Submitted on ' + claim.updatedAt;
        claim.subtitle = 'This claim is still being processed by Veteran Affairs.';
      } else if (claim.state == 'processed') {
        claim.title = 'Processed on ' + claim.updatedAt;
        claim.subtitle = 'The Veteran Affairs have finished processing this claim.';
      }
    }

    //
    // Watchers
    //
    $scope.$watch(function () {
      return claimService.userClaims;
    }, function (newVal) {
      $scope.claim = _.find(claimService.userClaims, {id: $scope.claimId});
      updateClaim($scope.claim);
    });

  }
]);
