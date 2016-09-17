var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', 'claimService', '$stateParams',
  function($scope, claimService, $stateParams) {
    $scope.claimId = $stateParams.claimId;
    $scope.allForms = [
      {
        title: 'VA-2392 Intent to File',
        summary: 'This form is meant for blah blah something to hold your place in line.',
        required: true
      }
    ];
    var partitionForms = _.partition($scope.allForms, 'required');
    $scope.requiredForms = partitionForms[0];
    $scope.optionalForms = partitionForms[1];
    $scope.numRequiredCompleted = 1;
    $scope.progressBarType = $scope.numRequiredCompleted == $scope.requiredForms.length ? 'success' : undefined;

    $scope.onClickCancel = function() {
      console.log("Are you sure you want to cancel? You will have to start over if you do. Y/N?");
      claimService.removeClaim($stateParams.claimId);
    };
  }
]);
