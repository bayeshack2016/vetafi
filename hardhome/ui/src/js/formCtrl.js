/**
 * Controller for the form filling page.
 */
'use strict';
var app = angular.module('vetafiApp');
app.controller('formCtrl', ['$scope', '$filter', '$rootScope', 'formConfig',
  '$stateParams', '$state', 'userValues', '$window', 'net', '$interval', 'busySpinner', '$q',
    function ($scope, $filter, $rootScope, formConfig,
              $stateParams, $state, userValues, $window, net, $interval, busySpinner, $q) {
      $scope.title = formConfig[$stateParams.formId].vfi.title;
      $scope.description = formConfig[$stateParams.formId].vfi.description;
      $scope.claimId = $stateParams.claimId;
      $scope.formId = $stateParams.formId;

      $scope.onDownload = function() {
        var popup = $window.open("/loading", "_blank");
        save(false).then(
          function() {
            busySpinner.showBusyUntilDownload();
            popup.location.href = "/pdf/" + $stateParams.claimId + "/" + $stateParams.formId;
          }
        );
      };

      $scope.onSubmit = function () {
        busySpinner.showBusy();
        save(true).then(
          function () {
            $state.go('root.claimselect', {claimId: $stateParams.claimId}).then(
              function success() {
                busySpinner.hideBusy();
              },
              function failure(err) {
                busySpinner.hideBusy();
                console.error(err);
              }
            );
          });
      };

      $scope.onSave = function () {
        busySpinner.showBusy();
        save(true).then(busySpinner.hideBusy, busySpinner.hideBusy);
      };

      $window.addEventListener("visibilitychange",
        save,
        false);

      $window.addEventListener("onbeforeunload",
        save,
        false);

      var lastParams = null;
      function save(force) {
        if (lastParams === null || !_.isEqual(lastParams, $scope.model) || force === true) {
          lastParams = _.clone($scope.model);
          return net.saveForm($stateParams.claimId, $stateParams.formId, $scope.model);
        } else {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        }
      }

      // TODO delete inteval saving
      /*var saveIntervalPromise = $interval(save, 1000);
      $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        $interval.cancel(saveIntervalPromise)
      });*/

      $scope.model = userValues.values; // TODO(jeff) fix extra attributes messing up completion percentage
      $scope.fields = formConfig[$stateParams.formId].fields;
      $scope.fieldsByKey = _.keyBy(formConfig[$stateParams.formId].fields, 'key');

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
        return total;
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
