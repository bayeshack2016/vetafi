var app = angular.module('vetafiApp');
app.controller('modalBasicOneButtonCtrl', ['$scope', '$uibModalInstance',
  function($scope, $uibModalInstance) {
    $scope.title = $scope.modalData.title;
    $scope.message = $scope.modalData.message;
    $scope.btnText = $scope.modalData.buttonName;
    
    $scope.onClose = function() {
      $uibModalInstance.close();
    };
  }
]);

app.controller('modalBasicTwoButtonCtrl', ['$scope', '$uibModalInstance',
  function($scope, $uibModalInstance) {
    $scope.title = $scope.modalData.title;
    $scope.message = $scope.modalData.message;
    $scope.successText = $scope.modalData.successText;
    $scope.cancelText = $scope.modalData.cancelText;

    $scope.onCancel = function() {
      $uibModalInstance.close();
    };

    $scope.onSuccess = function() {
      $uibModalInstance.close();
    };
  }
]);
