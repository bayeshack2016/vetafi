var app = angular.module('vetafiApp');
app.controller('claimConfirmModifyEmailCtrl', ['$scope', 'email',
  function($scope, email) {
    $scope.email = email;
    console.log($scope);
  }
]);
