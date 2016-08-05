var app = angular.module('vetafiApp');
app.controller('claimConfirmCtrl', ['$scope', '$location', 'net', 'claimService',
  function($scope, $location, net, claimService) {
    $scope.onClickBack = function() {
      $location.path('/claim/select-forms');
    };

    $scope.onClickConfirm = function() {
      var claim = claimService.getIncompleteClaim();
      if (!_.isEmpty(claim)) {
        net.submitClaim(claim.id).then(function(resp) {
          // todo: set claim state or re-fetch all user claims?
          if (resp) {
            $location.path("/claim/submitted");
          } else {
            $location.path("/claim/submitted").search({error: 'missing'});
          }
        });
      } else {
        $location.path("/claim/submitted").search({error: 'unknown'});
      }
    };
  }
]);
