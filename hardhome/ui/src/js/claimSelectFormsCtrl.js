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
      return form && form.answeredRequired == form.requiredQuestions ? 1 : 0;
    }));
    $scope.numRequiredForms = _.sum(_.map($scope.allForms, function (form) {
      return form.vfi && form.vfi.required ? 1 : 0;
    }));

    $scope.isCompletedForm = function(myForm) {
      return myForm && myForm.answeredRequired > 0 && myForm.answeredRequired >= myForm.requiredQuestions;
    };

    $scope.onClickCancel = function() {
      $state.go('root.home');
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
