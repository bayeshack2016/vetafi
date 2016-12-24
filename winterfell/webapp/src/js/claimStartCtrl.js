var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$state', 'net', 'claimService', '$uibModal', 'Profile',
  function ($scope, $state, net, claimService, $uibModal, Profile) {
    $scope.isLoggedIn = Profile.isSetUser();

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
      net.startClaim(
        {forms: ["VBA-21-0966-ARE"]} // hardcoded to create claim with only this form for now
      ).then(function (res) {
        console.log(res.data);
        claimService.createNewClaim();
        $state.transitionTo('root.claimselect', {claimId: res.data.claim._id});
      });
    };
  }
]);
