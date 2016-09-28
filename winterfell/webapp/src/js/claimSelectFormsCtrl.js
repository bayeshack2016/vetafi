var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', '$state', '$stateParams', 'claimService', 'formTemplateService',
  function($scope, $state, $stateParams, claimService, formTemplateService) {
    $scope.claimId = $stateParams.claimId;

    $scope.allForms = formTemplateService; // returns an object {formId -> {...}}
    var userForms = {};                    // should be {formId -> {...}}
    // TODO: state of all forms edited by user
    // var userForms = {
    //   'VBA-21-0966-ARE': {
    //      state: 'complete'
    //   }
    // };
    $scope.requiredForms = [];
    $scope.optionalForms = [];
    $scope.numRequiredCompleted = 0;
    $scope.progressBarType = undefined;

    function partitionAllForms() {
      var partitionForms = _.partition($scope.allForms, 'required');
      $scope.requiredForms = partitionForms[0];
      $scope.optionalForms = partitionForms[1];
    }

    function calcFormState(state, required) {
      if (state == 'complete') {
        return 'complete';
      } else if (required) {
        return 'required_incomplete';
      } else {
        return 'incomplete';
      }
    }

    function calcFormsCompleted() {
      var numRequiredCompleted = 0;

      _.map(_.keys($scope.allForms), function(formId) {
        var targetForm = $scope.allForms[formId];
        var userForm = userForms[formId];
        var userFormState = userForm ? userForm.state : 'incomplete';
        targetForm.id = formId;
        targetForm.state = calcFormState(userFormState, targetForm.required);

        if (targetForm.required && targetForm.state == 'complete') {
          numRequiredCompleted++;
        }
      });

      $scope.numRequiredCompleted = numRequiredCompleted;
      $scope.progressBarType = $scope.numRequiredCompleted == $scope.requiredForms.length ? 'success' : undefined;
    }

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      claimService.removeClaim($stateParams.claimId);
    };

    $scope.onClickDone = function() {
      console.log("Verifying things are correct...");
    };

    partitionAllForms();
    calcFormsCompleted();
  }
]);
