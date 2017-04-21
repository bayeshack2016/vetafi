var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formTemplateService', '$stateParams', '$state', 'claimForms', 'net', 'downloadSpinner',
  function($scope, claimService, formTemplateService, $stateParams, $state, claimForms, net, downloadSpinner) {
    $scope.claimId = $stateParams.claimId;

    $scope.onDownload = function(formId) {
      window.open("/pdf/" + $stateParams.claimId + "/" + formId, "_blank")
      downloadSpinner.showBusyUntilDownload();
    };

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
      net.signClaim($stateParams.claimId).then(
        function success(res) {
          $state.go('root.sign', {claimId: $stateParams.claimId}).then(
            function success() {},
            function failure(err) {
              console.error(err);
            }
          );
        },
        function failure(err) {
          console.error(err);
        }
      )
    };
  }
]);
