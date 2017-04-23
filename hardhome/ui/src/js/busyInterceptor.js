var app = angular.module('vetafiApp');
var BUSY_DELAY = 1000; // Will not show loading graphic until 1000ms have passed and we are still waiting for responses.

/*
app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('busyHttpInterceptor');
})
  .factory('busyHttpInterceptor', ['$q', '$timeout', function ($q, $timeout) {
    var counter = 0;
    return {
      request: function (config) {
        counter += 1;
        $timeout(
          function () {
            if (counter !== 0) {
              angular.element('#busy-overlay').show();
            }
          },
          BUSY_DELAY);
        return config;
      },
      response: function (response) {
        counter -= 1;
        if (counter === 0) {
          angular.element('#busy-overlay').hide();
        }
        return response;
      },
      requestError: function (rejection) {
        counter -= 1;
        if (counter === 0) {
          angular.element('#busy-overlay').hide();
        }
        return rejection;
      },
      responseError: function (rejection) {
        counter -= 1;
        if (counter === 0) {
          angular.element('#busy-overlay').hide();
        }
        return rejection;
      }
    }
  }]);
*/
