var app = angular.module('vetafiApp');
app.controller('tosCtrl', ['$scope', '$location',
  function($scope, $location) {
    $scope.onAccept = function() {
      var input = $('.vfi-checkbox input');
      if (input.prop('checked')) {
        console.log('Continue!');
      } else {
        $('.vfi-error-msg').text('You must check the checkbox above to agree and continue.');
      }
    };

    $scope.onDecline = function() {
      $location.path('/');
    };
  }
]);
