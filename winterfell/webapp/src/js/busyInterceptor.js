var app = angular.module('vetafiApp');

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('busyHttpInterceptor');
})
  .factory('busyHttpInterceptor', function ($q) {
    var counter = 0;
    return {
      request: function (config) {
        counter += 1;
        if (counter !== 0) {
          angular.element('#busy-overlay').show();
        }
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
  });
