var app = angular.module('vetafiApp');
app.controller('claimConfirmModifyContactCtrl', ['$scope', '$uibModalInstance',
  function($scope, $uibModalInstance) {
    var modalData = $scope.modalData;

    $scope.forType = modalData.forType;
    $scope.targetIndex = modalData.targetIndex;
    $scope.modalTitle = '';
    if (modalData.forType == 'address') {
      $scope.modalTitle = $scope.targetIndex >= 0 ? 'Edit Address' : 'Add Address';
    } else if (modalData.forType == 'email') {
      $scope.modalTitle = $scope.targetIndex >= 0 ? 'Edit Email' : 'Add Email';
    }

    $scope.onCloseModal = function() {
      $uibModalInstance.close();
    };

    $scope.onDelete = function() {
      console.log('remove from list!');
      $scope.onCloseModal();
    };

    $scope.onSave = function() {
      console.log('save and add to list!');
      $scope.onCloseModal();
    };
  }
]);
