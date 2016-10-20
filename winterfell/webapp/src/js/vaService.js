'use strict';
var app = angular.module('vetafiApp');
app.service('vaService', function () {
  this.vaAddress = {
    line1: 'Somewhere Street',
    city: 'Washington',
    state: 'DC',
    country: 'US',
    zip: '20854',
    name: 'Department of Veteran Affairs'
  };

  this.getAddress = function () {
    return this.vaAddress;
  };
});
