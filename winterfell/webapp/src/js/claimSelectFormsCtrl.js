var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formTemplateService', '$stateParams',
  function($scope, claimService, formTemplateService, $stateParams) {
    $scope.claimId = $stateParams.claimId;
    $scope.forms = formTemplateService;

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      var claim = claimService.getIncompleteClaim();
      claimService.removeClaim(claim.id);
    };
  }
]);
