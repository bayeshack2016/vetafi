'use strict';
var app = angular.module('vetafiApp');
app.service('vaService', function() {
    this.vaAddress = {
      title: 'Department of Veteran Affairs',
      address: {
        line1: 'Somewhere Street',
        city: 'Washington',
        state: 'DC',
        country: 'USA',
        zip: '20854'
      }
    };

    this.getAddress = function() {
      return this.vaAddress;
    };
});
