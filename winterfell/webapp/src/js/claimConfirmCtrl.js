var app = angular.module('vetafiApp');
app.controller('claimConfirmCtrl', ['$scope', '$state', 'net', 'claimService', '$stateParams',
  function($scope, $location, net, claimService, $stateParams) {
    $scope.claimId = $stateParams.claimId;

    $scope.onClickConfirm = function() {
      var claim = claimService.getIncompleteClaim();
      if (!_.isEmpty(claim)) {
        net.submitClaim($stateParams.claimId).then(function(resp) {
          // todo: set claim state or re-fetch all user claims?
          if (resp) {
            $state.transitionTo("root.claimsubmit", {claimId: $stateParams.claimId});
          } else {
            $state.transitionTo("root.claimsubmit", {claimId: $stateParams.claimId, error: 'missing'});
          }
        });
      } else {
        $state.transitionTo("root.claimsubmit", {claimId: $stateParams.claimId, error: 'unknown'});
      }
    };
  }
]);
