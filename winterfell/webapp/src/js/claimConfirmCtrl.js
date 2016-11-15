var app = angular.module('vetafiApp');
app.controller('claimConfirmCtrl', ['$scope', '$state', '$stateParams', 'net', '$uibModal', 'userValues', 'forms', 'formTemplateService',
  'user', 'vaService',
  function($scope, $state, $stateParams, net, $uibModal, userValues, forms, formTemplateService, user, vaService) {
    $scope.claimId = $stateParams.claimId;
    $scope.vaAddress = vaService.getAddress();
    $scope.userAddress = user.user.contact.address;
    $scope.userEmail = user.user.email;
    $scope.emailList = [
      {
        name: 'Me',
        email: user.email
      }
    ];

    $scope.formsList = forms;
    $scope.formsInfo = formTemplateService;

    $scope.onClickEditAddress = function (index) {
      openModifyContactModal();
    };

    $scope.onClickEditEmail = function (index) {
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
        console.log("new email", email);
        $scope.userEmail = email;
      }, function () {
        console.log('modal-component dismissed at: ' + new Date());
      });
    }

    $scope.onClickConfirm = function () {
      net.submitClaim($stateParams.claimId,
        {
          toAddress: $scope.vaAddress,
          fromAddress: $scope.userAddress
        }
      )
        .then(function (resp) {
          // todo: set claim state or re-fetch all user claims?
          if (resp) {
            $state.go("root.claimsubmit", {claimId: $stateParams.claimId});
          } else {
            $state.go("root.claimsubmit", {claimId: $stateParams.claimId, error: 'missing'});
          }
        });
    };
  }
]);
