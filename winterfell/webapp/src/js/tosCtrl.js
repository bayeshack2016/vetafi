var app = angular.module('vetafiApp');
app.controller('tosCtrl', ['$scope', '$location', 'claimService',
  function($scope, $location, claimService) {
    $scope.onAccept = function() {
      var input = $('.vfi-checkbox input');
      if (input.prop('checked')) {
        claimService.acceptTos(true);
        var fakeClaim = {
          id: 'qwer',
          state: 'incomplete'
        };
        claimService.createNewClaim(fakeClaim);
        $location.path('/claim/select-forms')
      } else {
        $('.vfi-error-msg').text('You must check the checkbox above to agree and continue.');
      }
    };

    $scope.onDecline = function() {
      $location.path('/');
    };
  }
]);
