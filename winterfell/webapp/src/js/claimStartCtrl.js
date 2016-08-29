var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$location', 'net', 'claimService', '$uibModal',
  function ($scope, $location, net, claimService, $uibModal) {
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
        console.log('/claim/' + res.data.claim.externalId + '/select-forms');
        $location.path('/claim/' + res.data.claim.externalId + '/select-forms');
      });
    };
  }
]);
