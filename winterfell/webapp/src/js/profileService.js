'use strict';
var app = angular.module('vetafiApp');
app.factory('profileService', ['claimService', function(claimService) {
  return {
    userInfo: {},
    clearUserInfo: function() {
      sessionStorageHelper.removePair(vfiConstants.keyUserId);
      this.userInfo = {};
      claimService.clearClaims();
    }
  };
}]);
