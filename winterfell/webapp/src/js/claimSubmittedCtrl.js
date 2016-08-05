var app = angular.module('vetafiApp');
app.controller('claimSubmittedCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    var errorMessages = {
      missing: 'Missing Information',
      unknown: 'Unknown Error'
    };
    $scope.declined = Boolean($routeParams.error);
    $scope.canFix = $routeParams.error != 'unknown';
    $scope.errorMessage = errorMessages[$routeParams.error];
  }
]);
