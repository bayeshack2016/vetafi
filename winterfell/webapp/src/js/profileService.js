'use strict';
var app = angular.module('vetafiApp');
app.factory('profileService', function() {
  return {
    userInfo: {},
    clearUserInfo: function() {
      sessionStorageHelper.removePair(vfiConstants.keyUserId);
      this.userInfo = {};
    }
  };
});
