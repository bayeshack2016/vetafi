var app = angular.module('vetafiApp');
app.controller('claimSubmittedCtrl', ['$scope', '$location',
  function($scope, $location) {
    // Make it simple. It's either successful or an unknown failure.
    // In the future, we can help people correct any mistakes, if possible.
    $scope.rejected = Boolean($location.search().error);
  }
]);
