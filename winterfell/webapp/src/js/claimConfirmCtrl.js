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
        country: 'USA',
        zip: '20854'
      }
    };

    $scope.mailingList = [
      $scope.vaAddress,
      {
        title: 'Home',
        address: {
          sendTo: 'Aaron Hsu',
          line1: '1223 4th Street',
          line2: 'Apt #211',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zip: '94158'
        }
      },
      {
        title: "Brother's crib",
        address: {
          sendTo: 'Austin Hsu',
          line1: '983 Victory Road',
          city: 'Rockville',
          state: 'MD',
          country: 'USA',
          zip: '20834'
        }
      },
    ];
    $scope.emailList = [
      {
        name: 'Me',
        email: 'ahsu@gmail.com'
      },
      {
        name: 'Mom',
        email: 'mom@gmail.com'
      }
    ];

    $scope.formsList = [
      {
        id: 'va_2723',
        title: 'VA-27343 Intent to File',
        summary: 'Something that blah blah holds your place in line when filing.'
      }
    ];

    $scope.onClickAddAddress = function() {
      return openModifyContactModal('address', $scope.mailingList);
    };

    $scope.onClickEditAddress = function(index) {
      return openModifyContactModal('address', $scope.mailingList, index);
    };

    $scope.onClickAddEmail = function() {
      return openModifyContactModal('email', $scope.emailList);
    };

    $scope.onClickEditEmail = function(index) {
      return openModifyContactModal('email', $scope.emailList, index);
    };

    function openModifyContactModal(forType, list, index) {
      $scope.modalData = {
        forType: forType,
        list: list,
        targetIndex: index >= 0 ? index : -1
      };
      return $uibModal.open({
        scope: $scope,
        controller: 'claimConfirmModifyContactCtrl',
        templateUrl: 'templates/modals/confirmClaimModifyContact.html'
      });
    }

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
