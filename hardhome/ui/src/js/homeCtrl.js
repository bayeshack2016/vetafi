var app = angular.module('vetafiApp');
app.controller('homeCtrl', ['$scope', 'Profile', 'claimService',
  function($scope, Profile, claimService) {
    $scope.isSignedIn = Profile.isSetUser();
    $scope.hasIncompleteClaim = claimService.hasIncompleteClaim();
    $scope.currentClaim = claimService.currentClaim || {};
  }
]);
