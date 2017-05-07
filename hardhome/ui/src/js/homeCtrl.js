var app = angular.module('vetafiApp');
app.controller('homeCtrl', ['$scope', 'Profile', 'claimService', 'net', '$uibModal',
  function($scope, Profile, claimService, net, $uibModal) {
    $scope.isSignedIn = Profile.isSetUser();
    $scope.hasIncompleteClaim = claimService.hasIncompleteClaim();
    $scope.currentClaim = claimService.currentClaim || {};
  }
]);
