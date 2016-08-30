var app = angular.module('vetafiApp');
app.controller('claimSelectFormsCtrl', ['$scope', '$location', 'claimService',
  function($scope, $location, claimService) {

    $scope.forms = [
      {
        id: 'asdf',
        name: 'Form A',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
        category: '',
        required: true,
        completed: false
      },
      {
        id: 'qwer',
        name: 'Form B',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt ut labore et dolore magna.',
        category: '',
        required: false,
        completed: false,
      },
      {
        id: 'zxcv',
        name: 'Form C',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
        category: '',
        required: false,
        completed: true
      }
    ];

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
