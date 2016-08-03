'use strict';
var app = angular.module('vetafiApp');
app.factory('claimService', function() {
  return {
    userClaims: [
      {
        id: 'asdf',
        updatedAt: '123',
        state: 'incomplete'
      },
      {
        id: 'qwer',
        updatedAt: '456',
        state: 'submitted'
      },
      {
        id: 'zxcv',
        updatedAt: '999',
        state: 'processed'
      }
    ],
    clearClaims: function() {
      this.userClaims = [];
    },
    hasIncompleteClaim: function() {
      return _.some(this.userClaims, {'state': 'incomplete'});
    }
  };
});
