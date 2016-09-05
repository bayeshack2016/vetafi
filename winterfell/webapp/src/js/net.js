'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['xhrEnv', '$http', function(xhrEnv, $http) {
  var baseUrl = xhrEnv.baseServerUrl;

  // social properties
  var socialIdMe = {
    clientId: '71ffbd3f04241a56e63fa6a960fbb15e',
    redirectServerUri: baseUrl + "/auth/link/idme",
    responseType: 'code',
    scope: 'military'
  };

  var httpGet = function (url, data) {
    // For Front-end only Development
    // This is used for testing "success" server calls
    if (xhrEnv.isDev) {
      var future = $.Deferred();
      future.resolve();
      return future;
    }
    return $http({
      url: url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpPost = function(url, data) {
    // For Front-end only Development
    // This is used for testing "success" server calls
    if (xhrEnv.isDev) {
      var future = $.Deferred();
      future.resolve();
      return future;
    }
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
    deleteUserAccount: function() {
      return httpDelete("/user");
    },
    linkIdMe: function() {
      var url = 'https://api.id.me/oauth/authorize';
      url += '?client_id=' + encodeURIComponent(socialIdMe.clientId);
      url += '&redirect_uri=' + encodeURIComponent(socialIdMe.redirectServerUri);
      url += '&response_type=' + encodeURIComponent(socialIdMe.responseType);
      url += '&scope=' + encodeURIComponent(socialIdMe.scope);

      return $http({
        url: url,
        method: "JSONP",
        headers: { 'Content-Type': 'application/json' },
      });
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
