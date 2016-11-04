var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formTemplateService', '$stateParams', '$state', 'claimForms',
  function($scope, claimService, formTemplateService, $stateParams, $state, claimForms) {
    $scope.claimId = $stateParams.claimId;

    // claimForms is an array of form objects associated with claim
    // myForms is a mapping of formId -> claimForm object
    $scope.myForms = _.keyBy(claimForms, function(form) {
      return form.key;
    });
    // All available forms
    $scope.allForms = formTemplateService;

    $scope.numRequiredCompleted = _.sum(_.map(claimForms, function (form) {
      return form && form.answered == form.answerable ? 1 : 0;
    }));
    $scope.numRequiredForms = _.sum(_.map($scope.allForms, function (form) {
      return form.vfi && form.vfi.required ? 1 : 0;
    }));

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      claimService.removeClaim($stateParams.claimId);
    };

    $scope.onClickDone = function() {
      $state.go('root.claimconfirm', {claimId: $stateParams.claimId}).then(
        function success() {},
        function failure(err) {
          console.error(err);
        }
      );
    };
  }
]);
