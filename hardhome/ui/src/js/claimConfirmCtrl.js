var app = angular.module('vetafiApp');
app.controller('claimConfirmCtrl', ['$scope', '$state', '$stateParams', 'net', '$uibModal', 'userValues', 'forms', 'formConfig',
  'user', 'vaService', 'claimService', '$filter',
  function($scope, $state, $stateParams, net, $uibModal, userValues, forms, formConfig, user, vaService, claimService, $filter) {
    $scope.claimId = $stateParams.claimId;
    $scope.vaAddress = vaService.getAddress();
    $scope.user = user || {};
    $scope.userEmail = $scope.user.email;
    $scope.userAddress = $scope.user.contact.address;
    $scope.emailList = [
      {
        name: 'Me',
        email: $scope.userEmail
      }
    ];
    $scope.dateToday = $filter('date')(new Date(), 'MM/dd/yyyy');

    $scope.formsList = forms;
    $scope.formsInfo = formConfig;

    $scope.onClickEditAddress = function () {
      openModifyContactModal();
    };

    $scope.onClickEditEmail = function () {
      openModifyEmailModal();
    };

    function openModifyContactModal() {
      var modalInstance = $uibModal.open({
        scope: $scope,
        controller: 'claimConfirmModifyAddressCtrl',
        templateUrl: 'templates/modals/confirmClaimModifyAddress.html',
        resolve: {
          address: function () {
            return _.cloneDeep($scope.userAddress);
          }
        }
      });

      modalInstance.result.then(function (address) {
        console.log("new address", address);
        $scope.userAddress = address;
      }, function () {
        console.log('modal-component dismissed at: ' + new Date());
      });
    }

    function openModifyEmailModal() {
      var modalInstance = $uibModal.open({
        scope: $scope,
        controller: 'claimConfirmModifyEmailCtrl',
        templateUrl: 'templates/modals/confirmClaimModifyEmail.html',
        resolve: {
          email: function () {
            return $scope.userEmail;
          }
        }
      });

      modalInstance.result.then(function (email) {
        $scope.userEmail = email;
      }, function () {
        console.log('modal-component dismissed at: ' + new Date());
      });
    }

    $scope.onClickConfirm = function () {
      var data = {
        toAddress: $scope.vaAddress,
        fromAddress: $scope.userAddress,
        emails: [$scope.userEmail],                       // copies sent to which emails
        addresses: [$scope.vaAddress, $scope.userAddress] // copies sent to which addresses
      };
      net.submitClaim($stateParams.claimId, data)
        .then(function (resp) {
          if (resp) {
            claimService.submitCurrentClaim();
            $state.go("root.claimsubmit", {claimId: $stateParams.claimId});
          } else {
            $state.go("root.claimsubmit", {claimId: $stateParams.claimId, error: 'unknown'});
          }
        }).catch(function (data) {
          $state.go("root.claimsubmit", {claimId: $stateParams.claimId, error: 'unknown'});
        });
    };
  }
]);
