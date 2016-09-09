var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$state', 'net', 'claimService', '$uibModal',
  function ($scope, $state, net, claimService, $uibModal) {
    function getTosAgreement() {
      return $uibModal.open({
        controller: 'tosCtrl',
        templateUrl: 'templates/tos.html'
      });
    }

    $scope.onClickNext = function () {
      if (!claimService.acceptedTos()) {
        if (!getTosAgreement()) {
          return;
        }
      }
      net.startClaim().then(function (res) {
        $state.transitionTo('root.claimselect', {claimId: res.data.claim.externalId});
      });
    };
  }
]);
