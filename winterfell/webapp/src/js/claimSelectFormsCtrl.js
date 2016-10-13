var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formTemplateService', '$stateParams', 'forms',
  function($scope, claimService, formTemplateService, $stateParams, forms) {
    $scope.claimId = $stateParams.claimId;
    $scope.formTemplates = formTemplateService;
    $scope.forms = _.keyBy(forms, function(form) {
      return form.key;
    });

    $scope.numRequiredCompleted = _.sum(_.map(forms, function (form) {
      return form.answered == form.answerable ? 1 : 0;
    }));
    $scope.numRequiredForms = forms.length;

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      claimService.removeClaim($stateParams.claimId);
    };

    $scope.onClickDone = function() {
      console.log("Verifying things are correct...");
    };
  }
]);
