var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', '$state', '$stateParams', 'claimService', 'formTemplateService',
  function($scope, $state, $stateParams, claimService, formTemplateService) {
    $scope.claimId = $stateParams.claimId;

    $scope.allForms = formTemplateService; // returns an object {formId -> {...}}
    var userForms = [ // TODO: state of all forms edited by user
      {
        id: 'VBA-21-0966-ARE',
        state: 'incomplete'
      }
    ];
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
      for(var i = 0; i < userForms.length; i++) {
        var userForm = userForms[i];
        var targetForm = $scope.allForms[userForm.id];
        if (targetForm) {
          var required = targetForm.required;
          var state = calcFormState(userForm.state, required);
          $scope.allForms[userForm.id].id = userForm.id;
          $scope.allForms[userForm.id].state = state;
          if (required && state == 'complete') {
            numRequiredCompleted++;
          }
        }
      }
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
