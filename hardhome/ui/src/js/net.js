'use strict';
var app = angular.module('vetafiApp');
app.factory('net', ['xhrEnv', '$http', function(xhrEnv, $http) {

  var httpGet = function (url) {
    return $http({
      url: "/api" + url,
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpPost = function(url, data) {
    return $http({
      url: "/api" + url,
      method: "POST",
      data: data || {},
      headers: { 'Content-Type': 'application/json' }
    });
  };

  var httpDelete = function(url) {
    return $http.delete(url);
  };

  return {
    touchSession: function() {
      return httpGet("/session/touch");
    },
    getAuthIdMeUrl: function() {
      return '/auth/idme';
    },
    changePassword: function(oldPwd, newPwd) {
      var data = {
        old: oldPwd,
        new: newPwd
      };
      return httpPost("/auth/password", data);
    },

    // User
    getUserInfo: function() {
      return httpGet("/user");
    },
    getUserValues: function() {
      return httpGet("/user/values");
    },
    editUserInfo: function(data) {
      return httpPost("/user", data);
    },
    deleteUserAccount: function() {
      return httpDelete("/user");
    },

    // Claims
    getClaimsForUser: function() {
      return httpGet("/claims");
    },
    startClaim: function(data) {
      return httpPost("/claims/create", data);
    },
    submitClaim: function(claimId, data) {
      return httpPost("/claim/" + claimId + "/submit", data);
    },
    discardClaim: function(claimId) {
      return httpDelete("/claim/" + claimId);
    },
    getClaim: function(claimId) {
      return httpGet("/claim/" + claimId);
    },
    getFormsForClaim: function(claimId) {
      return httpGet("/claim/" + claimId + "/forms");
    },
    saveForm: function(claimId, formId, data) {
      return httpPost('/save/' + claimId + '/' + formId, data);
    },
    downloadForm: function(claimId, formId) {
      return httpGet("/claim/" + claimId + "/form/" + formId + "/pdf");
    }
  };
}]);
