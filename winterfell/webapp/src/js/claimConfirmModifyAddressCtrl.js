var app = angular.module('vetafiApp');
app.controller('claimConfirmModifyAddressCtrl', ['$scope', 'address',
  function($scope, address) {
    $scope.address = address;
  }
]);
