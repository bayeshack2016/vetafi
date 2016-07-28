'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['$http', function($http) {
  var baseUrl = "http://localhost:3999";

  var httpGet = function (url, data) {
    return $http({
      url: baseUrl + url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpPost = function(url, data) {
    return $http({
      url: baseUrl + url,
      method: "POST",
      data: data || {},
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpDelete = function(url) {
    return $http.delete(url);
  };

  var getSessionUserId = function() {
    return sessionStorageHelper.getPair(vfiConstants.keyUserId);
  }

  return {
    login: function (email, password) {
      var data = {
        email: email,
        password: password
      };
      return httpPost("/auth/login", data);
    },
    logout: function() {
      return httpGet("/auth/logout");
    },
    signup: function(userData) {
      return httpPost("/auth/signup", userData);
    },
    checkSession: function() {
      return httpGet("/session/check");
    },
    extendSession: function() {
      return httpPost("/session/extend");
    },
    getUserInfo: function() {
      var userId = getSessionUserId();
      return httpGet("/user/" + userId);
    },
    deleteUserAccount: function() {
      var userId = getSessionUserId();
      return httpDelete("/user/" + userId);
    }
  };
}]);
