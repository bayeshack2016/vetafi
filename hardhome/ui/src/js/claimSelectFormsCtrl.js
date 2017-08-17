var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', 'formConfig', '$stateParams', '$state', 'claimForms', 'net', 'busySpinner',
  function($scope, claimService, formConfig, $stateParams, $state, claimForms, net, busySpinner) {
    $scope.claimId = $stateParams.claimId;

    $scope.onDownload = function(formId) {
      window.open("/pdf/" + $stateParams.claimId + "/" + formId, "_blank");
      busySpinner.showBusyUntilDownload();
    };

    // claimForms is an array of form objects associated with claim
    // myForms is a mapping of formId -> claimForm object
    $scope.myForms = _.keyBy(claimForms, function(form) {
      return form.key;
    });
    // All available forms
    $scope.formConfigs = formConfig;

    $scope.numRequiredCompleted = _.sum(_.map(claimForms, function (form) {
      return form && form.answeredRequired == form.requiredQuestions ? 1 : 0;
    }));
    $scope.numRequiredForms = _.sum(_.map(claimForms, function (form) {
      return formConfig[form.key].vfi.required ? 1 : 0;
    }));

    $scope.isCompletedForm = function(myForm) {
      return myForm && myForm.answeredRequired > 0 && myForm.answeredRequired >= myForm.requiredQuestions;
    };

    $scope.onClickCancel = function() {
      $state.go('root.home');
    };

    $scope.onClickDone = function() {
      busySpinner.showBusy();
      net.signClaim($stateParams.claimId).then(
        function success(res) {
          $state.go('root.sign', {claimId: $stateParams.claimId}).then(
            function success() {
              busySpinner.hideBusy();
            },
            function failure(err) {
              busySpinner.hideBusy();
              console.error(err);
            }
          );
        },
        function failure(err) {
          busySpinner.hideBusy();
          console.error(err);
        }
      )
    };
  }
]);
