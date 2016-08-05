'use strict';
var app = angular.module('vetafiApp');
app.factory('claimService', ['net',
  function(net) {
    var tosAccepted = false;
    return {
      /*
       * Claim objects contains:
       * id
       * state
       *
       */
      userClaims: [],
      clearClaims: function() {
        this.userClaims = [];
      },
      acceptedTos: function() {
        return this.tosAccepted;
      },
      acceptTos: function(accepted) {
        this.tosAccepted = accepted;
      },
      hasIncompleteClaim: function() {
        return _.some(this.userClaims, {'state': 'incomplete'});
      },
      getIncompleteClaim: function() {
        return _.find(this.userClaims, {'state': 'incomplete'});
      },
      createNewClaim: function(newClaim) {
        this.userClaims = _.concat(this.userClaims, newClaim);
      },
      removeClaim: function(claimId) {
        _.remove(this.userClaims, {'id': claimId});
      }
    };
  }
]);
