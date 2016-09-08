var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', '$location', 'claimService', 'formTemplateService', '$routeParams',
  function($scope, $location, claimService, formTemplateService, $routeParams) {

    $scope.claimId = $routeParams.claimId;
    $scope.forms = formTemplateService;

    $scope.onClickFinish = function() {
      $location.path('/claim/confirm');
    };

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      var claim = claimService.getIncompleteClaim();
      claimService.removeClaim(claim.id);
    };
  }
]);
