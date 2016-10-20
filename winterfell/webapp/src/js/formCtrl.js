/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');

app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formTemplateService',
    'formService', '$stateParams', '$state', 'userValues', '$window',
    function ($scope, $filter, $rootScope, formTemplateService, formService,
              $stateParams, $state, userValues, $window) {

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
        save(
          function(err, response) {
            if (err) {
              console.error(err);
              return;
            }

            $window.open('/claim/' + $stateParams.claimId + '/form/' + $stateParams.formId + '/pdf');
          }
        );
      };

      $scope.onSubmit = function () {
        console.log('onSubmit');
          save(function (err, response) {
            console.log(err, response);
            console.log('onSubmit transition');
            $state.go('root.claimselect', {claimId: $stateParams.claimId}).then(
              function success() {},
              function failure(err) {
                console.error(err);
              }
            );
          });
      };

      $scope.onSave = function () {
        save(function (err, response) {
          console.log(err, response);
        });
      };

      function save(callback) {
        formService.save($stateParams.claimId, $stateParams.formId, $scope.model, callback);
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
        return total;
      }

      function countAnswered(model) {
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

