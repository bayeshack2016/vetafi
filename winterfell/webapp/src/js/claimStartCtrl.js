var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$location', 'net', 'claimService',
  function($scope, $location, net, claimService) {
    $scope.onClickNext = function() {
      net.startClaim().then(function() {
        var fakeClaim = {
          id: 'qwer',
          state: 'incomplete'
        };
        if (claimService.acceptedTos()) {
          claimService.createNewClaim(fakeClaim);
          $location.path('/claim/select-forms');
        } else {
          $location.path('/tos');
        }
      });
    };
  }
]);
