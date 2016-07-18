'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['$http', function($http) {
  var baseUrl = "http://localhost:3999";

  var get = function (url, data) {
    return $http({
      url: baseUrl + url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var post = function(url, data) {
    return $http({
      url: baseUrl + url,
      method: "POST",
      data: data || {},
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return {
    login: function (email, password) {
      var data = {
        email: email,
        password: password
      };
      return post("/auth/login", data);
    },
    logout: function() {
      return get("/auth/logout");
    },
    signup: function(userData) {
      return post("/auth/signup", userData);
    },
    getUserInfo: function() {
      var userId = sessionStorageHelper.getPair(vfiConstants.keyUserId);
      return get("/user/" + userId);
    }
  };
}]);
