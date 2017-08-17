var app = angular.module('vetafiApp');
app.controller('claimStartCtrl', ['$scope', '$state', 'net', 'claimService', '$uibModal', 'Profile',
  'claimConfig',
  function ($scope, $state, net, claimService, $uibModal, Profile, claimConfig) {
    $scope.isSignedIn = Profile.isSetUser();

    $scope.claimConfig = claimConfig;

    function callStartClaim(claim) {
      net.startClaim(
        claim
      ).then(function (res) {
        claimService.createNewClaim();
        $state.transitionTo('root.claimselect', {claimId: res.data.claimID});
      });
    }

    $scope.startClaim = function (claim) {
      if (!claimService.acceptedTos()) {
        var tosModal = $uibModal.open({
          controller: 'tosCtrl',
          templateUrl: 'templates/tos.html',
          backdrop: 'static'
        });
        tosModal.result.then(function(res) {
          if (res) {
            callStartClaim(claim);
          }
        }, function () {
          console.log('tos modal dismissed');
        });
      } else {
        callStartClaim(claim);
      }
    };
  }
]);
