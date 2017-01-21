var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$state', 'net', 'claimService', '$uibModal', 'Profile',
  function ($scope, $state, net, claimService, $uibModal, Profile) {
    $scope.isLoggedIn = Profile.isSetUser();

    function callStartClaim() {
      net.startClaim(
        {forms: ["VBA-21-0966-ARE"]} // hardcoded to create claim with only this form for now
      ).then(function (res) {
        claimService.createNewClaim();
        $state.transitionTo('root.claimselect', {claimId: res.data.claim._id});
      });
    }

    $scope.onClickNext = function () {
      if (!claimService.acceptedTos()) {
        var tosModal = $uibModal.open({
          controller: 'tosCtrl',
          templateUrl: 'templates/tos.html',
          backdrop: 'static'
        });
        tosModal.result.then(function(res) {
          if (res) {
            callStartClaim();
          }
        }, function () {
          console.log('tos modal dismissed');
        });
      }
    };
  }
]);
