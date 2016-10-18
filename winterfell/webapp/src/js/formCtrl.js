/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');

app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formRenderingService', 'formTemplateService',
    'formService', '$stateParams', '$state', 'userValues',
    function ($scope, $filter, $rootScope, formRenderingService, formTemplateService, formService,
              $stateParams, $state, userValues) {
        $scope.$watch('signature', function (newVal, oldVal) {
            console.log(newVal, oldVal);
            if (newVal) {
                $scope.model['signature'] = newVal.dataUrl;
            }
        });

      $scope.$watch('dataurl', function (newVal, oldVal) {
        console.log(newVal, oldVal);
        if (newVal) {
          $scope.model.signature = newVal;
        } else {
          delete $scope.model.signature;
        }
      });

      function currentDate() {
        return $filter('date')(new Date(), 'MM/dd/yyyy');
      }

      $scope.render = function () {
        var out = [];
        for (var k in $scope.model) {
          if ($scope.model.hasOwnProperty(k)) {
            out.push({fieldName: k, fieldValue: $scope.model[k]})
          }
        }
        formRenderingService.render($stateParams.formId, out);
      };

      $scope.onSubmit = function () {
          $scope.save();
          $state.transitionTo('root.claimselect', {claimId: $stateParams.claimId});
      };

      $scope.save = function () {
        formService.save($stateParams.claimId, $stateParams.formId, $scope.model, function (err, response) {
          console.log(err, response);
        })
      };

      $scope.model = userValues;
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

