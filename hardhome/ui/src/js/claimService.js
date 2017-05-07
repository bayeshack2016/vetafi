'use strict';
var app = angular.module('vetafiApp');
app.factory('claimService', [
  function() {
    var defaultClaim = {
      state: undefined,
      tosAccepted: false
    };
    var state = {
      INCOMPLETE: 'INCOMPLETE',
      SUBMITTED: 'SUBMITTED',
      DISCARDED: 'DISCARDED'
    };
    return {
      /*
       * This is used to track front-end properties
       * of current claim
       */
      currentClaim: defaultClaim,
      clearClaim: function() {
        this.currentClaim = defaultClaim;
      },
      setClaim: function(claim) {
        this.currentClaim = claim;
        this.currentClaim.tosAccepted = true;
      },
      createNewClaim: function() {
        this.currentClaim.state = state.INCOMPLETE;
      },
      hasIncompleteClaim: function() {
        return this.currentClaim ? this.currentClaim.state == state.INCOMPLETE : false;
      },
      submitCurrentClaim: function() {
        this.currentClaim.state = state.SUBMITTED;
      },
      discardCurrentClaim: function() {
        this.currentClaim.state = state.DISCARDED;
        this.currentClaim.tosAccepted = false;
      },
      acceptedTos: function() {
        return this.currentClaim.tosAccepted;
      },
      acceptTos: function(accepted) {
        this.currentClaim.tosAccepted = accepted;
      }
    };
  }
]);
