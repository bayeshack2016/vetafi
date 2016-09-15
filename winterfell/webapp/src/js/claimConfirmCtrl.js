var app = angular.module('vetafiApp');
app.controller('claimConfirmCtrl', ['$scope', '$state', 'net', 'claimService', '$stateParams', '$uibModal',
  function($scope, $location, net, claimService, $stateParams, $uibModal) {
    $scope.claimId = $stateParams.claimId;

    $scope.user = {
      firstName: 'Aaron',
      lastName: 'Hsu'
    };

    $scope.vaAddress = {
      title: 'Department of Veteran Affairs',
      address: {
        line1: 'Somewhere Street',
        city: 'Washington',
        state: 'DC',
        zip: '20854'
      }
    };

    $scope.mailingList = [
      $scope.vaAddress,
      {
        title: 'Home',
        address: {
          line1: '1200 4th Street',
          line2: 'Apt #219',
          city: 'San Francisco',
          state: 'CA',
          zip: '94158'
        }
      }
    ];
    $scope.emailList = [
      {
        email: 'ahsu1230@gmail.com'
      }
    ];

    $scope.formsList = [
      {
        id: 'va_2723',
        title: 'VA-27343 Intent to File',
        summary: 'Something that blah blah holds your place in line when filing.'
      }
    ];

    $scope.onClickAddAddress = function(index) {
      return $uibModal.open({
        template: '<h3>Add Address</h3>'
      });
    };

    $scope.onClickEditAddress = function(index) {
      return $uibModal.open({
        template: '<h3>Edit Address</h3>'
      });
    };

    $scope.onClickAddEmail = function() {
      return $uibModal.open({
        template: '<h3>Add Email</h3>'
      });
    };

    $scope.onClickEditEmail = function() {
      return $uibModal.open({
        template: '<h3>Edit Email</h3>'
      });
    };

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
