var app = angular.module('vetafiApp');
app.controller('homeCtrl', ['$scope', 'Profile', 'claimService', 'net', '$uibModal',
  function($scope, Profile, claimService, net, $uibModal) {
    $scope.isSignedIn = Profile.isSetUser();
    $scope.hasIncompleteClaim = claimService.hasIncompleteClaim();
    $scope.currentClaim = claimService.currentClaim || {};

    $scope.clickSubscribe = function() {
      var newScope = $scope.$new(true);
      newScope.headline = "Subscribe for Updates";
      newScope.submitSubscribe = function(email) {
        net.subscribe({email: email}).then(
          function success() {
            newScope.$dismiss()
          },
          function failure() {
            newScope.$dismiss()
          }
        )
      };

      $uibModal.open({
        scope: newScope,
        templateUrl: 'templates/modals/subscribe.html',
        windowClass: 'ngdialog-theme-default'
      });
    };
  }
]);
