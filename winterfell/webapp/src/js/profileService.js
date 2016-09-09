'use strict';
var app = angular.module('vetafiApp');
app.service('Profile', ['claimService', '$q', 'net', function(claimService, $q, net) {
    this.user = null;

    this.logout = function() {
      claimService.clearClaims();
      this.unsetUser();
    };

    this.setUser = function(user) {
      this.user = user;
    };

    this.unsetUser = function() {
      this.user = null;
    };

    this.isSetUser = function() {
      return this.user != null;
    };

    this.getUser = function() {
      return this.user;
    };

    this.resolveUser = function() {
      var deferred = $q.defer();

      if (this.isSetUser()) {
        deferred.resolve(this.getUser());
        return deferred.promise;
      }

      var that = this;
      net.getUserInfo().then(function success(res) {
        that.setUser(res.data);
        deferred.resolve(res.data);
      }, function failure(res) {
        // Eventually this should be failure
        // and we should handle a redirect to the login page
        deferred.resolve(null);
      });

      return deferred.promise;
    };
}]);
