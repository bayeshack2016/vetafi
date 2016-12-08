/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formTemplateService',
  '$stateParams', '$state', 'userValues', '$window', 'net', '$interval',
    function ($scope, $filter, $rootScope, formTemplateService,
              $stateParams, $state, userValues, $window, net, $interval) {
      $scope.title = formTemplateService[$stateParams.formId].vfi.title;
      $scope.description = formTemplateService[$stateParams.formId].vfi.description;

      $scope.$watch('signature', function (newVal) {
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
          function success() {
            $window.location.href = '/claim/' + $stateParams.claimId + '/form/' + $stateParams.formId + '/pdf';
          }
        );
      };

      $scope.onSubmit = function () {
        save().then(
          function () {
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

      var saveIntervalPromise = $interval(save, 1000);
      $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $interval.cancel(saveIntervalPromise)
      });

      $scope.model = userValues.values.values; // TODO(jeff) fix extra attributes messing up completion percentage
      $scope.signature = $scope.model.signature;
      $scope.fields = formTemplateService[$stateParams.formId].fields;
      $scope.fieldsByKey = _.keyBy(formTemplateService[$stateParams.formId].fields, 'key');

      for (var i = 0; i < $scope.fields.length; i++) {
        if ($scope.fields[i].key.indexOf('date_signed') !== -1) {
          $scope.model[$scope.fields[i].key] = currentDate();
        }
      }

      function countAnswerable() {
        var total = 0;
        for (var i = 0; i < $scope.fields.length; i++) {
          if (!$scope.fields[i].templateOptions.optional) {
            if ($scope.fields[i].hasOwnProperty('hideExpression')) {
              if (!$scope.$eval($scope.fields[i].hideExpression)) {
                total += 1;
              }
            } else {
              total += 1;
            }
          }
        }
        return total + 1; // Plus one for signature.
      }

      function countAnswered(model) {
        var k, count = 0;
        for (k in $scope.fieldsByKey) {
          if ($scope.fieldsByKey.hasOwnProperty(k)) {
            if (model.hasOwnProperty(k) && model[k] !== '' && !$scope.fieldsByKey[k].templateOptions.optional) {
              count++;
            }
          }
        }

        if (model.signature) {
          count++;
        }

        return count;
      }

      $scope.answered = 0;
      $scope.answerable = 0;

      $scope.getProgress = function () {
        return ($scope.answered / $scope.answerable) * 100.0;
      };

      $scope.updateProgress = function() {
        $scope.answered = countAnswered($scope.model);
        $scope.answerable = countAnswerable($scope.model);
      };

      $scope.$watch('model', function () {
        $scope.updateProgress();
      }, true)
    }]);
