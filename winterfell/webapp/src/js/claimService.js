'use strict';
var app = angular.module('vetafiApp');
app.factory('claimService', function() {
  return {
    userClaims: [
      {
        id: 'asdf',
        updatedAt: '123',
        state: 'incomplete',
        files: [
          { id: 'A', name: 'FormA', type: 'va', description: 'Something about form A.' },
          { id: 'B', name: 'FormB', type: 'va', description: 'Another thing about form B.' }
        ]
      },
      {
        id: 'qwer',
        updatedAt: '456',
        state: 'submitted',
        files: [
          { id: 'A', name: 'FormA', type: 'va', description: 'Something about form A.' },
          { id: 'C', name: 'FormC', type: 'user', description: 'Blah blah blah in form C.' }
        ]
      },
      {
        id: 'zxcv',
        updatedAt: '999',
        state: 'processed',
        files: [
          { id: 'A', name: 'FormA', type: 'va', description: 'Something about form A.' },
          { id: 'B', name: 'FormB', type: 'va', description: 'Another thing about form B.' },
          { id: 'C', name: 'FormC', type: 'user', description: 'Blah blah blah in form C.' }
        ]
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
