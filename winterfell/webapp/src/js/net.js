'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['xhrEnv', '$http', function(xhrEnv, $http) {

  var httpGet = function (url, data) {
    return $http({
      url: url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpPost = function(url, data) {
    return $http({
      url: url,
      method: "POST",
      data: data || {},
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpDelete = function(url) {
    /* For Front-end only Development */
    if (window.location.host == localDevHost) {
      var future = $.Deferred();
      future.resolve();
      return future;
    }
    return $http.delete(url);
  };

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
    touchSession: function() {
      return httpGet("/session/touch");
    },

    // User
    getUserInfo: function() {
      return httpGet("/user");
    },
    getUserValues: function() {
      return httpGet("/user/values");
    },
    deleteUserAccount: function() {
      return httpDelete("/user");
    },
    getAuthIdMeUrl: function() {
      return '/auth/idme';
    },

    // Claims
    getClaimsForUser: function() {
      return httpGet("/claims");
    },
    startClaim: function() {
      return httpPost("/claims/create");
    },
    submitClaim: function(extClaimId) {
      return httpPost("/claim/" + extClaimId + "/submit");
    },
    discardClaim: function(extClaimId) {
      return httpDelete("/claim/" + extClaimId);
    }
  };
}]);
