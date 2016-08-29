'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['xhrEnv', '$http', function(xhrEnv, $http) {
  var baseUrl = xhrEnv.baseServerUrl;

  var httpGet = function (url, data) {
    // For Front-end only Development
    // This is used for testing "success" server calls
    if (xhrEnv.isDev) {
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
    // For Front-end only Development
    // This is used for testing "success" server calls
    if (xhrEnv.isDev) {
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
    getAuthIdMeUrl: function() {
      // Retrieved from the Id.Me Vetafi dashboard
      debugger;
      var clientId = xhrEnv.idMeClientId;
      var url = "https://api.id.me/oauth/authorize";
      url += "?client_id=" + clientId;
      url += "&redirect_uri=" + baseUrl + "/auth/link/idme";
      url += "&response_type=code";
      url += "&scope=military";
      return url;
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
