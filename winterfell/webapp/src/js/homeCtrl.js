var app = angular.module('vetafiApp');
app.controller('homeCtrl', ['$scope', 'profileService', 'claimService',
  function($scope, profileService, claimService) {
    $scope.isLoggedIn = false;
    $scope.hasIncompleteClaim = false;

    //
    // Watchers
    //
    $scope.$watch(function() {
      return profileService.userInfo;
    }, function (newVal) {
      if (_.isEmpty(newVal)) {
        $scope.isLoggedIn = false;
      } else {
        $scope.isLoggedIn = true;
      }
    });

    $scope.$watch(function() {
      return claimService.userClaims;
    }, function (newVal) {
      $scope.hasIncompleteClaim = claimService.hasIncompleteClaim();
    })
  }
]);
