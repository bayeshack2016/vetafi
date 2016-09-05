var app = angular.module('vetafiApp');
app.controller('claimSubmittedCtrl', ['$scope', '$stateParams',
  function($scope, $stateParams) {
    var errorMessages = {
      missing: 'Missing Information',
      unknown: 'Unknown Error'
    };
    $scope.declined = Boolean($stateParams.error);
    $scope.canFix = $stateParams.error != 'unknown';
    $scope.errorMessage = errorMessages[$stateParams.error];
  }
]);
