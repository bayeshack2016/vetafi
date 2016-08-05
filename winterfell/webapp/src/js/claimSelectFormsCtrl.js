var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', '$location',
  function($scope, $location) {

    $scope.onClickFinish = function() {
      $location.path('/claim/confirm');
    };

  }
]);
