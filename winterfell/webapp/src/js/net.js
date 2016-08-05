'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['$http', function($http) {
  var localDevHost = 'localhost:3000';
  var baseUrl = "http://localhost:3999";

  var httpGet = function (url, data) {
    /* For Front-end only Development */
    if (window.location.host == localDevHost) {
      var future = $.Deferred();
      future.resolve();
      return future;
    }
    return $http({
      url: baseUrl + url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpPost = function(url, data) {
    /* For Front-end only Development */
    if (window.location.host == localDevHost) {
      var future = $.Deferred();
      future.resolve();
      return future;
    }
    return $http({
      url: baseUrl + url,
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
    touchSession: function() {
      return httpGet("/session/touch");
    },

    // User
    getUserInfo: function() {
      var userId = getSessionUserId();
      return httpGet("/user/" + userId);
    },
    deleteUserAccount: function() {
      var userId = getSessionUserId();
      return httpDelete("/user/" + userId);
    },

    // Claims
    getClaimsForUser: function() {
      var userId = getSessionUserId();
      return httpGet("/claims/user" + userId);
    },
    startClaim: function() {
      return httpPost("/claims/create");
    },
    submitClaim: function(extClaimId) {
      return httpPost("/claims/" + extClaimId + "/submit");
    },
    discardClaim: function(extClaimId) {
      return httpDelete("/claims/" + extClaimId);
    }
  };
}]);
