/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');

app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formTemplateService', '$stateParams', '$state', 'userValues', '$window', 'net',
    function ($scope, $filter, $rootScope, formTemplateService,
              $stateParams, $state, userValues, $window, net) {

      $scope.title = formTemplateService[$stateParams.formId].unofficialTitle;
      $scope.description = formTemplateService[$stateParams.formId].unofficialDescription;

      $scope.$watch('signature', function (newVal, oldVal) {
        if (newVal) {
          $scope.model.signature = newVal;
        } else {
          delete $scope.model.signature;
        }
      });

      function currentDate() {
        return $filter('date')(new Date(), 'MM/dd/yyyy');
      }

      $scope.onRender = function () {
        save().then(
          function success(response) {
            $window.location.href = '/claim/' + $stateParams.claimId + '/form/' + $stateParams.formId + '/pdf';
          },
          function failure(response) {
            console.error(response);
          }
        );
      };

      $scope.onSubmit = function () {
        console.log('onSubmit');
        save().then(
          function (response) {
            $state.go('root.claimselect', {claimId: $stateParams.claimId}).then(
              function success() {
              },
              function failure(err) {
                console.error(err);
              }
            );
          });
      };

      $scope.onSave = function () {
        save().then(function (response) {
          console.log(response);
        });
      };

      function save() {
        return net.saveForm($stateParams.claimId, $stateParams.formId, $scope.model);
      }

      $scope.model = userValues.values.values; // TODO(jeff) fix extra attributes messing up completion percentage
      $scope.signature = $scope.model.signature;
      console.log($scope);
      $scope.fields = formTemplateService[$stateParams.formId].fields;


      for (var i = 0; i < $scope.fields.length; i++) {
        if ($scope.fields[i].key.indexOf('date_signed') !== -1) {
          $scope.model[$scope.fields[i].key] = currentDate();
        }
      }

      function countAnswerable(model) {
        var total = 0;
        for (var i = 0; i < $scope.fields.length; i++) {
          if ($scope.fields[i].hasOwnProperty('hideExpression')) {
            if (!$scope.$eval($scope.fields[i].hideExpression)) {
              total += 1;
            }
          } else {
            total += 1;
          }
        }
        return total + 1; // Plus one for signature.
      }

      function countAnswered(model) {
        console.log(model);
        var k, count = 0;
        for (k in model) {
          if (model.hasOwnProperty(k)) {
            count++;
          }
        }
        return count;
      }

      $scope.answered = 0;
      $scope.answerable = 0;

      $scope.getProgress = function () {
        return ($scope.answered / $scope.answerable) * 100.0;
      };

      $scope.$watch('model', function (newVal, oldVal) {
        $scope.answered = countAnswered(newVal);
        $scope.answerable = countAnswerable(newVal);
      }, true)
    }]);

