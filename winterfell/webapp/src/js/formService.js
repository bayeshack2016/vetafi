var app = angular.module('vetafiApp');
app.factory('formService', ['$http', function ($http) {
  return {
    render: function (formName, data, cb) {
      var req = {
        method: 'POST',
        url: '/save/' + formName,
        headers: {
          'Content-Type': 'application/json'
        },
        data: data,
        withCredentials: true
      };

      $http(req)
        .then(function (response) {
          cb(null, response);
        },
        function (response) {
          cb(response, null);
        }
      );
    }
  }
}]);