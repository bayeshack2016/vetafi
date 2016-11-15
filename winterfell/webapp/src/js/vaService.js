'use strict';
var app = angular.module('vetafiApp');
app.service('vaService', function () {
  this.vaAddress = {
    street1: 'Somewhere Street',
    city: 'Washington',
    province: 'DC',
    country: 'US',
    postal: '20854',
    name: 'Department of Veteran Affairs'
  };

  this.getAddress = function () {
    return this.vaAddress;
  };
});
