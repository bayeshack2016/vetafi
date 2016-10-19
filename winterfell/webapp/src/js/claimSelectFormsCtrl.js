var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formTemplateService', '$stateParams', 'claimForms',
  function($scope, claimService, formTemplateService, $stateParams, claimForms) {
    $scope.claimId = $stateParams.claimId;
    $scope.formTemplates = formTemplateService;
    $scope.forms = _.keyBy(claimForms, function(form) {
      return form.key;
    });

    $scope.numRequiredCompleted = _.sum(_.map(claimForms, function (form) {
      return form.vfi.required && form.answered == form.answerable ? 1 : 0;
    }));
    $scope.numRequiredForms = _.sum(_.map($scope.formTemplates, function (form) {
      return form.vfi.required ? 1 : 0;
    }));

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      claimService.removeClaim($stateParams.claimId);
    };

    $scope.onClickDone = function() {
      $state.transitionTo("root.claimconfirm", {claimId: $stateParams.claimId});
    };
  }
]);
