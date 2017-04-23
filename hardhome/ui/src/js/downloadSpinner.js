'use strict';
var app = angular.module('vetafiApp');
app.service('downloadSpinner', ['$interval', '$cookies', function($interval, $cookies) {
  var INTERVAL = 100;
  var COOKIE_NAME = 'fileDownloadToken';
  var SPINNER_ELEMENT_LOCATOR = '#busy-overlay';

  function downloadComplete() {
    return $cookies.getAll().hasOwnProperty(COOKIE_NAME)
  }

  this.showBusy = function() {
    angular.element(SPINNER_ELEMENT_LOCATOR).show();
  };

  this.hideBusy = function() {
    angular.element(SPINNER_ELEMENT_LOCATOR).hide();
  };

  this.showBusyUntilDownload = function() {
    angular.element(SPINNER_ELEMENT_LOCATOR).show();

    var promise;

    function checkComplete() {
      if (downloadComplete()) {
        $cookies.remove(COOKIE_NAME);
        angular.element(SPINNER_ELEMENT_LOCATOR).hide();
        if (promise) {
          $interval.cancel(promise);
          promise = undefined;
        }
      } else {
        console.log("Waiting for download..")
      }
    }

    promise = $interval(checkComplete, INTERVAL);
  };
}]);
