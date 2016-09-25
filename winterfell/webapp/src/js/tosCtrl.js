var app = angular.module('vetafiApp');
app.controller('tosCtrl', ['$scope', '$location', 'claimService',
  function($scope, $location, claimService) {
    $scope.onAccept = function() {
      if ($scope.accept) {
        claimService.acceptTos(true);
        if (typeof $scope.$close !== 'undefined') {
          $scope.$close(true);
        }
      } else {
        $('.vfi-error-msg').text('You must check the checkbox above to agree and continue.');
      }
    };

    $scope.onDecline = function() {
      $scope.$close(true);
      $location.path('/');
    };
  }
]);
