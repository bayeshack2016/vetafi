'use strict';
var app = angular.module('vetafiApp');
app.controller('signDocumentCtrl', ['$scope', '$filter', '$stateParams', '$state', 'claimForms', 'net', '$uibModal',
    function ($scope, $filter, $stateParams, $state, claimForms, net, $uibModal) {
      $scope.forms = claimForms;
      $scope.currentFormIndex = 0;
      $scope.allFormsSigned = false;
      $scope.showPrompt = false;

      $scope.advance = function() {
          var form = $scope.forms[$scope.currentFormIndex];
          net.getFormSignatureStatus(form.claimID, form.key).then(
              function success(res) {
                  if (res.data === true) {
                      $scope.currentFormIndex += 1;
                      if ($scope.currentFormIndex > $scope.forms.length) {
                          $scope.allFormsSigned = true
                      }
                  } else {
                      var newScope = $scope.$new(true);
                      newScope.headline = "Not Signed!";
                      newScope.message = "Please complete the signature process for this form before continuing.";
                      $uibModal.open({
                          scope: newScope,
                          templateUrl: 'templates/modals/oneButtonModal.html',
                          windowClass: 'ngdialog-theme-default'
                      });
                  }
              }, function failure(err) {
                  console.error("failure", err)
              });

      };
    }
]);
